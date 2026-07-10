import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ModuleRegistry,
} from 'ag-grid-community';
import { Shipment, Office, Customer } from '../../models/domain.models';
import { ShipmentsApiService, CreateShipmentPayload } from '../../shared/services/shipments-api.service';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { DeliveryMode } from '../../utils/delivery-mode.enum';
import { ShipmentStatus } from '../../utils/shipment-status.enum';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-shipments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './shipments-page.component.html',
  styleUrl: './shipments-page.component.scss',
})
export class ShipmentsPageComponent implements OnInit {
  private readonly shipmentsApi = inject(ShipmentsApiService);
  private readonly companyApi = inject(CompanyApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private gridApi!: GridApi;

  shipments: Shipment[] = [];
  rowData: Shipment[] = [];
  offices: Office[] = [];
  customers: Customer[] = [];
  showCreateForm = false;
  submitting = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  formError = '';

  readonly DeliveryMode = DeliveryMode;

  readonly form = this.fb.group({
    receiverName: [''],
    receiverCustomerId: [null as number | null],
    deliveryMode: [DeliveryMode.OFFICE, Validators.required],
    weight: [null as number | null, [Validators.required, Validators.min(0.1)]],
    officeId: [null as number | null],
    senderCustomerId: [null as number | null],
    description: [''],
    deliveredAddress: [''],
    deliveredCity: [''],
    deliveredZip: [''],
    deliveredCountry: [''],
  });

  get isAdmin(): boolean { return this.authService.hasAnyRole([1]); }
  get isEmployee(): boolean { return this.authService.hasAnyRole([2]); }
  get isCustomer(): boolean { return this.authService.hasAnyRole([3]); }
  get canSelectRegisteredReceiver(): boolean { return this.isAdmin || this.isEmployee; }
  get isAddressMode(): boolean { return this.form.get('deliveryMode')?.value === DeliveryMode.ADDRESS; }

  readonly statusStyleByStatus: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'display:inline-flex;align-items:center;justify-content:center;min-width:7.5rem;padding:0.25rem 0.75rem;border-radius:999px;font-weight:700;font-size:0.8rem;text-transform:capitalize;color:#9a6700;background:#fff3cd;',
    [ShipmentStatus.IN_TRANSIT]: 'display:inline-flex;align-items:center;justify-content:center;min-width:7.5rem;padding:0.25rem 0.75rem;border-radius:999px;font-weight:700;font-size:0.8rem;text-transform:capitalize;color:#0a58ca;background:#cfe2ff;',
    [ShipmentStatus.DELIVERED]: 'display:inline-flex;align-items:center;justify-content:center;min-width:7.5rem;padding:0.25rem 0.75rem;border-radius:999px;font-weight:700;font-size:0.8rem;text-transform:capitalize;color:#146c43;background:#d1e7dd;',
    [ShipmentStatus.CANCELLED]: 'display:inline-flex;align-items:center;justify-content:center;min-width:7.5rem;padding:0.25rem 0.75rem;border-radius:999px;font-weight:700;font-size:0.8rem;text-transform:capitalize;color:#b02a37;background:#f8d7da;',
  };

  readonly columnDefs: ColDef[] = [
    { headerName: 'Tracking #', field: 'trackingNumber', flex: 1.5 },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => {
        const status = params.data?.status as ShipmentStatus | undefined;
        const label = status?.replace('_', ' ') ?? '—';
        const style = status
          ? this.statusStyleByStatus[status]
          : 'display:inline-flex;align-items:center;justify-content:center;min-width:7.5rem;padding:0.25rem 0.75rem;border-radius:999px;font-weight:700;font-size:0.8rem;text-transform:capitalize;background:#eef2f6;color:#4b5563;';
        return `<span style="${style}">${label}</span>`;
      },
    },
    {
      headerName: 'Sender',
      flex: 1.2,
      valueGetter: (p) => {
        const s = p.data?.sender;
        return s ? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() : '—';
      },
    },
    { headerName: 'Receiver', field: 'receiverName', flex: 1.2, valueGetter: (p) => this.getReceiverLabel(p.data) },
    { headerName: 'Office', flex: 1, valueGetter: (p) => p.data?.office?.name ?? '—' },
    { headerName: 'Mode', flex: 0.8, valueGetter: (p) => p.data?.deliveryMode ?? '—' },
    { headerName: 'Weight (kg)', field: 'weight', flex: 0.8, valueGetter: (p) => p.data?.weight ?? '—' },
    { headerName: 'Price', flex: 0.8, valueGetter: (p) => p.data?.priceSnapshot != null ? `$${Number(p.data.priceSnapshot).toFixed(2)}` : '—' },
    {
      headerName: 'Actions',
      flex: 1.5,
      cellRenderer: (params: ICellRendererParams) => {
        const s: Shipment = params.data;
        const btns: string[] = [];
        if ((this.isAdmin || this.isEmployee) && s.status === ShipmentStatus.PENDING) {
          btns.push(`<button class="btn btn-sm btn-outline-primary me-1" data-action="transit" data-id="${s.id}">In Transit</button>`);
        }
        if ((this.isAdmin || this.isEmployee) && s.status === ShipmentStatus.IN_TRANSIT) {
          btns.push(`<button class="btn btn-sm btn-outline-success me-1" data-action="deliver" data-id="${s.id}">Delivered</button>`);
        }
        if (this.isAdmin) {
          btns.push(`<button class="btn btn-sm btn-outline-secondary me-1" data-action="delete" data-id="${s.id}">Delete</button>`);
        }
        if (s.status === ShipmentStatus.PENDING) {
          btns.push(`<button class="btn btn-sm btn-outline-danger" data-action="cancel" data-id="${s.id}">Cancel</button>`);
        }
        return btns.join('') || '—';
      },
      onCellClicked: (event) => {
        const btn = (event.event?.target as HTMLElement)?.closest('[data-action]') as HTMLElement | null;
        if (!btn) return;
        const id = Number(btn.dataset['id']);
        const action = btn.dataset['action'];
        if (action === 'transit') this.markInTransit(id);
        if (action === 'deliver') this.markDelivered(id);
        if (action === 'delete') this.deleteShipment(id);
        if (action === 'cancel') this.cancelShipment(id);
      },
    },
  ];

  ngOnInit(): void {
    this.applyReceiverValidators();
    this.form.get('receiverCustomerId')?.valueChanges.subscribe(() => this.applyReceiverValidators());
    this.companyApi.getCompanies().subscribe(companies => {
      this.offices = companies.flatMap(c => c.offices ?? []);
    });
    if (this.isAdmin || this.isEmployee) {
      this.shipmentsApi.getCustomers().subscribe(c => { this.customers = c; });
    }
    this.reload();
  }

  onGridReady(event: GridReadyEvent): void { this.gridApi = event.api; }

  onQuickFilter(event: Event): void {
    this.gridApi?.setGridOption('quickFilterText', (event.target as HTMLInputElement).value);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.form.reset({ receiverName: '', receiverCustomerId: null, deliveryMode: DeliveryMode.OFFICE, weight: null, officeId: null, senderCustomerId: null, description: '', deliveredAddress: '', deliveredCity: '', deliveredZip: '', deliveredCountry: '' });
      this.applyReceiverValidators();
      this.formError = '';
    }
  }

  submitCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError = 'Please fill all required fields.';
      return;
    }
    const v = this.form.getRawValue();
    const payload: CreateShipmentPayload = {
      receiverName: (v.receiverName ?? '').trim() || undefined,
      receiverCustomerId: v.receiverCustomerId ? Number(v.receiverCustomerId) : undefined,
      deliveryMode: v.deliveryMode as DeliveryMode,
      weight: Number(v.weight),
      officeId: v.officeId ? Number(v.officeId) : undefined,
      senderCustomerId: v.senderCustomerId ? Number(v.senderCustomerId) : undefined,
      description: (v.description ?? '').trim() || undefined,
    };
    if (v.deliveryMode === DeliveryMode.ADDRESS) {
      payload.deliveredAddress = (v.deliveredAddress ?? '').trim() || undefined;
      payload.deliveredCity = (v.deliveredCity ?? '').trim() || undefined;
      payload.deliveredZip = (v.deliveredZip ?? '').trim() || undefined;
      payload.deliveredCountry = (v.deliveredCountry ?? '').trim() || undefined;
    }
    this.submitting = true;
    this.formError = '';
    this.form.disable();
    this.shipmentsApi.createShipment(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateForm = false;
        this.form.enable();
        this.setFeedback('Shipment created.', 'success');
        this.reload();
      },
      error: (err) => {
        this.submitting = false;
        this.form.enable();
        const msg = err?.error?.message;
        this.formError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to create shipment.');
      },
    });
  }

  markInTransit(id: number): void {
    this.shipmentsApi.markInTransit(id).subscribe({
      next: () => { this.setFeedback('Marked in transit.', 'success'); this.reload(); },
      error: () => this.setFeedback('Failed.', 'error'),
    });
  }

  markDelivered(id: number): void {
    this.shipmentsApi.markDelivered(id).subscribe({
      next: () => { this.setFeedback('Marked delivered.', 'success'); this.reload(); },
      error: () => this.setFeedback('Failed.', 'error'),
    });
  }

  cancelShipment(id: number): void {
    this.shipmentsApi.cancel(id).subscribe({
      next: () => { this.setFeedback('Shipment cancelled.', 'success'); this.reload(); },
      error: () => this.setFeedback('Failed.', 'error'),
    });
  }

  deleteShipment(id: number): void {
    if (!confirm('Delete shipment?')) {
      return;
    }
    this.shipmentsApi.deleteShipment(id).subscribe({
      next: () => { this.setFeedback('Shipment deleted.', 'success'); this.reload(); },
      error: () => this.setFeedback('Failed to delete shipment.', 'error'),
    });
  }

  private reload(): void {
    this.shipmentsApi.getShipments().subscribe({
      next: (s) => { this.shipments = s; this.rowData = s; },
      error: () => this.setFeedback('Failed to load shipments.', 'error'),
    });
  }

  private applyReceiverValidators(): void {
    const receiverNameControl = this.form.get('receiverName');
    const receiverCustomerId = this.form.get('receiverCustomerId')?.value;
    if (!receiverNameControl) {
      return;
    }

    if (receiverCustomerId) {
      receiverNameControl.clearValidators();
    } else {
      receiverNameControl.setValidators([Validators.required]);
    }
    receiverNameControl.updateValueAndValidity({ emitEvent: false });
  }

  private getReceiverLabel(shipment: Shipment | undefined): string {
    if (shipment?.receiverCustomer) {
      return `${shipment.receiverCustomer.firstName ?? ''} ${shipment.receiverCustomer.lastName ?? ''}`.trim();
    }
    return shipment?.receiverName ?? '—';
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    setTimeout(() => { this.feedbackMessage = ''; this.feedbackType = ''; }, 4000);
  }
}
