import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  RowClassParams,
  ICellRendererParams,
} from 'ag-grid-community';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { CompanyModalComponent } from './components/company-modal/company-modal.component';
import { OfficeModalComponent } from './components/office-modal/office-modal.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';

ModuleRegistry.registerModules([AllCommunityModule]);

interface GridRow {
  rowType: 'company' | 'office';
  id: number;
  companyId?: number;
  name: string;
  address?: string;
  location?: string;
  officeSurcharge?: number;
  addressSurcharge?: number;
  pricePerKg?: number;
  officesCount?: number;
  companyOfficesCount?: number;
}

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular, CompanyModalComponent, OfficeModalComponent, ConfirmModalComponent],
  templateUrl: './companies-page.component.html',
  styleUrl: './companies-page.component.scss',
})
export class CompaniesPageComponent implements OnInit {
  private gridApi!: GridApi;
  rowData: GridRow[] = [];

  showCompanyModal = false;
  companyModalMode: 'create' | 'edit' = 'create';
  companyModalSubmitting = false;
  companyModalError = '';
  companyEditId: number | null = null;
  companyForm!: FormGroup;

  showOfficeModal = false;
  officeModalMode: 'add' | 'edit' = 'add';
  officeModalSubmitting = false;
  officeModalError = '';
  officeEditId: number | null = null;
  officeModalCompanyId: number | null = null;
  officeModalCompanyName = '';
  officeForm!: FormGroup;

  showConfirmModal = false;
  confirmMessage = '';
  private confirmCallback: (() => void) | null = null;

  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  columnDefs: ColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      cellRenderer: (params: ICellRendererParams) => {
        const row = params.data as GridRow;
        return row.rowType === 'company'
          ? `<strong>${row.name}</strong>`
          : `<span style="padding-left:24px">&#8627; ${row.name}</span>`;
      },
    },
    {
      headerName: 'Address / Location',
      flex: 2,
      valueGetter: (params) => {
        const row = params.data as GridRow;
        return row.rowType === 'company' ? (row.address ?? '—') : (row.location ?? '—');
      },
    },
    {
      headerName: 'Surcharge (Office / Address)',
      flex: 1.5,
      valueGetter: (params) => {
        const row = params.data as GridRow;
        if (row.rowType !== 'office') return '';
        return `$${Number(row.officeSurcharge ?? 0).toFixed(2)} / $${Number(row.addressSurcharge ?? 0).toFixed(2)}`;
      },
    },
    {
      headerName: 'Price/kg',
      flex: 1,
      valueGetter: (params) => {
        const row = params.data as GridRow;
        return row.rowType === 'office' ? `$${Number(row.pricePerKg ?? 0).toFixed(2)}` : '';
      },
    },
    {
      headerName: 'Offices',
      flex: 1,
      valueGetter: (params) => {
        const row = params.data as GridRow;
        return row.rowType === 'company' ? (row.officesCount ?? 0) : '';
      },
    },
    {
      headerName: 'Actions',
      flex: 2,
      cellRenderer: (params: ICellRendererParams) => {
        const row = params.data as GridRow;
        if (row.rowType === 'company') {
          return `<button class="btn btn-sm btn-outline-primary me-1" data-action="add-office" data-id="${row.id}" data-name="${row.name}">+ Office</button>
            <button class="btn btn-sm btn-outline-secondary me-1" data-action="edit-company" data-id="${row.id}">Edit</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete-company" data-id="${row.id}" data-name="${row.name}">Delete</button>`;
        }
        const isLast = (row.companyOfficesCount ?? 0) <= 1;
        return `<button class="btn btn-sm btn-outline-secondary me-1" data-action="edit-office" data-id="${row.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete-office" data-id="${row.id}" data-company="${row.companyId}" ${isLast ? 'disabled title="Cannot delete the last office"' : ''}>Delete</button>`;
      },
      onCellClicked: (event) => {
        const target = event.event?.target as HTMLElement;
        const btn = target?.closest('[data-action]') as HTMLElement | null;
        if (!btn) return;
        const action = btn.dataset['action'];
        const id = Number(btn.dataset['id']);
        const name = btn.dataset['name'] ?? '';
        const companyId = Number(btn.dataset['company']);
        if (action === 'delete-company') this.confirmDelete('company', id, name);
        if (action === 'delete-office') this.confirmDelete('office', id, name, companyId);
        if (action === 'add-office') this.openAddOfficeModal(id, name);
        if (action === 'edit-company') this.openEditCompanyModal(id);
        if (action === 'edit-office') this.openEditOfficeModal(id);
      },
    },
  ];

  getRowClass = (params: RowClassParams): string =>
    params.data?.rowType === 'company' ? 'company-group-row' : 'office-child-row';

  constructor(
    private readonly companyApi: CompanyApiService,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  onQuickFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  // ─── Company modal ────────────────────────────────────────────

  get offices(): FormArray {
    const offices = this.companyForm?.get('offices');
    return offices instanceof FormArray ? offices : this.fb.array([]);
  }

  newOfficeGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      officeSurcharge: [0, [Validators.required, Validators.min(0)]],
      addressSurcharge: [0, [Validators.required, Validators.min(0)]],
      pricePerKg: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addOfficeRow(): void { this.offices.push(this.newOfficeGroup()); }

  removeOfficeRow(index: number): void {
    if (this.offices.length > 1) this.offices.removeAt(index);
  }

  hasDuplicateOfficeName(): boolean {
    if (!this.companyForm?.get('offices')) return false;
    const names = this.offices.controls
      .map(c => (c.get('name')?.value ?? '').toLowerCase().trim())
      .filter(Boolean);
    return names.length !== new Set(names).size;
  }

  openCreateCompanyModal(): void {
    this.companyModalMode = 'create';
    this.companyEditId = null;
    this.companyModalError = '';
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      offices: this.fb.array([this.newOfficeGroup()]),
    });
    this.showCompanyModal = true;
  }

  openEditCompanyModal(id: number): void {
    const row = this.rowData.find(r => r.rowType === 'company' && r.id === id);
    if (!row) return;
    this.companyModalMode = 'edit';
    this.companyEditId = id;
    this.companyModalError = '';
    this.companyForm = this.fb.group({
      name: [row.name, Validators.required],
      address: [row.address ?? '', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    });
    this.showCompanyModal = true;
  }

  closeCompanyModal(): void {
    if (this.companyModalSubmitting) return;
    this.showCompanyModal = false;
  }

  submitCompanyModal(): void {
    if (this.companyModalMode === 'create' && this.hasDuplicateOfficeName()) {
      this.companyForm.markAllAsTouched();
      this.companyModalError = 'Office names must be unique within a company.';
      return;
    }
    if (this.companyForm.invalid) { this.companyForm.markAllAsTouched(); return; }

    this.companyModalSubmitting = true;
    this.companyModalError = '';
    this.companyForm.disable();
    const val = this.companyForm.getRawValue();

    const call = this.companyModalMode === 'create'
      ? this.companyApi.createCompanyWithOffices({
          name: val.name.trim(), address: val.address.trim(),
          offices: val.offices.map((o: any) => ({ name: o.name.trim(), location: o.location.trim(), officeSurcharge: Number(o.officeSurcharge), addressSurcharge: Number(o.addressSurcharge), pricePerKg: Number(o.pricePerKg) })),
        })
      : this.companyApi.updateCompany(this.companyEditId!, { name: val.name.trim(), address: val.address.trim() });

    call.subscribe({
      next: () => {
        this.companyModalSubmitting = false;
        this.showCompanyModal = false;
        this.setFeedback(this.companyModalMode === 'create' ? 'Company created.' : 'Company updated.', 'success');
        this.loadData();
      },
      error: (err) => {
        this.companyModalSubmitting = false;
        this.companyForm.enable();
        const msg = err?.error?.message;
        this.companyModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Operation failed.');
      },
    });
  }

  // ─── Office modal ─────────────────────────────────────────────

  openAddOfficeModal(companyId: number, companyName: string): void {
    this.officeModalMode = 'add';
    this.officeEditId = null;
    this.officeModalCompanyId = companyId;
    this.officeModalCompanyName = companyName;
    this.officeModalError = '';
    this.officeForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      officeSurcharge: [0, [Validators.required, Validators.min(0)]],
      addressSurcharge: [0, [Validators.required, Validators.min(0)]],
      pricePerKg: [0, [Validators.required, Validators.min(0)]],
    });
    this.showOfficeModal = true;
  }

  openEditOfficeModal(id: number): void {
    const row = this.rowData.find(r => r.rowType === 'office' && r.id === id);
    if (!row) return;
    const companyRow = this.rowData.find(r => r.rowType === 'company' && r.id === row.companyId);
    this.officeModalMode = 'edit';
    this.officeEditId = id;
    this.officeModalCompanyId = row.companyId ?? null;
    this.officeModalCompanyName = companyRow?.name ?? '';
    this.officeModalError = '';
    this.officeForm = this.fb.group({
      name: [row.name, Validators.required],
      location: [row.location ?? '', Validators.required],
      officeSurcharge: [row.officeSurcharge ?? 0, [Validators.required, Validators.min(0)]],
      addressSurcharge: [row.addressSurcharge ?? 0, [Validators.required, Validators.min(0)]],
      pricePerKg: [row.pricePerKg ?? 0, [Validators.required, Validators.min(0)]],
    });
    this.showOfficeModal = true;
  }

  closeOfficeModal(): void {
    if (this.officeModalSubmitting) return;
    this.showOfficeModal = false;
  }

  submitOfficeModal(): void {
    if (this.officeForm.invalid) { this.officeForm.markAllAsTouched(); return; }
    this.officeModalSubmitting = true;
    this.officeModalError = '';
    this.officeForm.disable();
    const val = this.officeForm.getRawValue();

    const call = this.officeModalMode === 'add'
      ? this.companyApi.createOffice({ name: val.name.trim(), location: val.location.trim(), officeSurcharge: Number(val.officeSurcharge), addressSurcharge: Number(val.addressSurcharge), pricePerKg: Number(val.pricePerKg), companyId: this.officeModalCompanyId! })
      : this.companyApi.updateOffice(this.officeEditId!, { name: val.name.trim(), location: val.location.trim(), officeSurcharge: Number(val.officeSurcharge), addressSurcharge: Number(val.addressSurcharge), pricePerKg: Number(val.pricePerKg) });

    call.subscribe({
      next: () => {
        this.officeModalSubmitting = false;
        this.showOfficeModal = false;
        this.setFeedback(this.officeModalMode === 'add' ? 'Office added.' : 'Office updated.', 'success');
        this.loadData();
      },
      error: (err) => {
        this.officeModalSubmitting = false;
        this.officeForm.enable();
        const msg = err?.error?.message;
        this.officeModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Operation failed.');
      },
    });
  }

  // ─── Confirm ──────────────────────────────────────────────────

  private confirmDelete(type: 'company' | 'office', id: number, name: string, _companyId?: number): void {
    this.confirmMessage = type === 'company' ? `Delete company "${name}" and all its offices?` : 'Delete this office?';
    this.confirmCallback = () => {
      if (type === 'company') {
        this.companyApi.deleteCompany(id).subscribe({
          next: () => { this.setFeedback('Company deleted.', 'success'); this.loadData(); },
          error: () => this.setFeedback('Failed to delete company.', 'error'),
        });
      } else {
        this.companyApi.deleteOffice(id).subscribe({
          next: () => { this.setFeedback('Office deleted.', 'success'); this.loadData(); },
          error: () => this.setFeedback('Failed to delete office.', 'error'),
        });
      }
    };
    this.showConfirmModal = true;
  }

  confirmYes(): void { this.showConfirmModal = false; this.confirmCallback?.(); this.confirmCallback = null; }
  confirmNo(): void { this.showConfirmModal = false; this.confirmCallback = null; }

  // ─── Data ─────────────────────────────────────────────────────

  private loadData(): void {
    this.companyApi.getCompanies().subscribe({
      next: (companies) => {
        const sorted = [...companies].sort((a, b) => a.name.localeCompare(b.name));
        const rows: GridRow[] = [];
        for (const c of sorted) {
          const offices = [...(c.offices ?? [])].sort((a, b) => a.name.localeCompare(b.name));
          rows.push({ rowType: 'company', id: c.id, name: c.name, address: c.address, officesCount: offices.length });
          for (const o of offices) {
            rows.push({ rowType: 'office', id: o.id, companyId: c.id, name: o.name, location: o.location, officeSurcharge: o.officeSurcharge, addressSurcharge: o.addressSurcharge, pricePerKg: o.pricePerKg, companyOfficesCount: offices.length });
          }
        }
        this.rowData = rows;
      },
      error: () => this.setFeedback('Failed to load companies.', 'error'),
    });
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    setTimeout(() => { this.feedbackMessage = ''; this.feedbackType = ''; }, 4000);
  }
}