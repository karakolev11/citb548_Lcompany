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
import { Company, Customer, Employee, Office } from '../../models/domain.models';
import {
  CreateCustomerWithUserPayload,
  CreateEmployeeWithUserPayload,
  UpdateCustomerPayload,
  UpdateEmployeeWithUserPayload,
  UsersApiService,
} from '../../shared/services/users-api.service';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { AuthService } from '../../auth/services/auth.service';
import { EmployeeModalComponent } from './components/employee-modal/employee-modal.component';
import { AdminModalComponent } from './components/admin-modal/admin-modal.component';
import { CustomerModalComponent } from './components/customer-modal/customer-modal.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular, EmployeeModalComponent, AdminModalComponent, CustomerModalComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly companyApi = inject(CompanyApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private employeesGridApi!: GridApi;
  private customersGridApi!: GridApi;

  activeTab: 'employees' | 'customers' = 'employees';
  employees: Employee[] = [];
  customers: Customer[] = [];
  companies: Company[] = [];
  officesByCompany: Office[] = [];
  selectedCompanyHasOffices = true;

  employeesRowData: Employee[] = [];
  customersRowData: Customer[] = [];

  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  showEmployeeModal = false;
  employeeModalMode: 'create' | 'edit' = 'create';
  employeeModalSubmitting = false;
  employeeModalError = '';
  employeeEditId: number | null = null;

  showAdminModal = false;
  adminModalSubmitting = false;
  adminModalError = '';

  showCustomerModal = false;
  customerModalMode: 'create' | 'edit' = 'create';
  customerModalSubmitting = false;
  customerModalError = '';
  customerEditId: number | null = null;

  readonly employeeForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    employeeType: ['office_staff' as 'courier' | 'office_staff', Validators.required],
    phone: [''],
    department: [''],
    jobTitle: [''],
    employeeId: [''],
    companyId: [null as number | null, [Validators.required, Validators.min(1)]],
    officeId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  readonly adminForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly customerForm = this.fb.group({
    username: ['', [Validators.minLength(3)]],
    email: ['', [Validators.email]],
    password: ['', [Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    country: [''],
    companyId: [null as number | null],
  });

  readonly employeeColumnDefs: ColDef[] = [
    {
      headerName: 'Name',
      flex: 1.5,
      valueGetter: (params) => `${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`.trim(),
    },
    {
      headerName: 'Username',
      field: 'user.username',
      flex: 1,
      valueGetter: (params) => params.data?.user?.username ?? '—',
    },
    {
      headerName: 'Email',
      field: 'user.email',
      flex: 1.5,
      valueGetter: (params) => params.data?.user?.email ?? '—',
    },
    {
      headerName: 'Company',
      flex: 1.2,
      valueGetter: (params) => params.data?.company?.name ?? '—',
    },
    {
      headerName: 'Office',
      flex: 1.2,
      valueGetter: (params) => params.data?.office?.name ?? '—',
    },
    {
      headerName: 'Type',
      flex: 1,
      valueGetter: (params) => this.formatEmployeeType(params.data?.employeeType),
    },
    {
      headerName: 'Department',
      field: 'department',
      flex: 1,
      valueGetter: (params) => params.data?.department ?? '—',
    },
    {
      headerName: 'Job Title',
      field: 'jobTitle',
      flex: 1,
      valueGetter: (params) => params.data?.jobTitle ?? '—',
    },
    {
      headerName: 'Actions',
      flex: 1.2,
      cellRenderer: (params: ICellRendererParams) => {
        const id = params.data?.id;
        return `<button class="btn btn-sm btn-outline-secondary me-1" data-action="edit" data-id="${id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${id}">Delete</button>`;
      },
      onCellClicked: (event) => {
        const target = event.event?.target as HTMLElement;
        const btn = target?.closest('[data-action]') as HTMLElement | null;
        if (!btn) return;
        const action = btn.dataset['action'];
        const id = Number(btn.dataset['id']);
        if (action === 'edit') this.openEditEmployeeModal(id);
        if (action === 'delete') this.deleteEmployee(id);
      },
    },
  ];

  readonly customersColumnDefs: ColDef[] = [
    {
      headerName: 'Name',
      flex: 1.5,
      valueGetter: (params) => `${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`.trim(),
    },
    {
      headerName: 'Username',
      flex: 1,
      valueGetter: (params) => params.data?.user?.username ?? '—',
    },
    {
      headerName: 'Email',
      flex: 1.5,
      valueGetter: (params) => params.data?.user?.email ?? '—',
    },
    {
      headerName: 'Phone',
      flex: 1,
      valueGetter: (params) => params.data?.phone ?? '—',
    },
    {
      headerName: 'Company',
      flex: 1.2,
      valueGetter: (params) => {
        return params.data?.company?.name ?? '—';
      },
    },
    {
      headerName: 'Actions',
      flex: 1.2,
      cellRenderer: (params: ICellRendererParams) => {
        const id = params.data?.id;
        return `<button class="btn btn-sm btn-outline-secondary me-1" data-action="edit" data-id="${id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${id}">Delete</button>`;
      },
      onCellClicked: (event) => {
        const target = event.event?.target as HTMLElement;
        const btn = target?.closest('[data-action]') as HTMLElement | null;
        if (!btn) return;
        const action = btn.dataset['action'];
        const id = Number(btn.dataset['id']);
        if (action === 'edit') this.openEditCustomerModal(id);
        if (action === 'delete') this.deleteCustomer(id);
      },
    },
  ];

  ngOnInit(): void {
    this.employeeForm.get('companyId')?.valueChanges.subscribe((companyId) => {
      this.officesByCompany = this.getOfficesForCompany(companyId ?? null);
      this.employeeForm.patchValue({ officeId: null }, { emitEvent: false });
      this.selectedCompanyHasOffices = this.officesByCompany.length > 0;
    });
    this.reload();
  }

  get isAdmin(): boolean {
    return this.authService.hasAnyRole([1]);
  }

  setTab(tab: 'employees' | 'customers'): void {
    this.activeTab = tab;
  }

  onEmployeesGridReady(event: GridReadyEvent): void {
    this.employeesGridApi = event.api;
  }

  onCustomersGridReady(event: GridReadyEvent): void {
    this.customersGridApi = event.api;
  }

  onEmployeesQuickFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.employeesGridApi?.setGridOption('quickFilterText', value);
  }

  onCustomersQuickFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customersGridApi?.setGridOption('quickFilterText', value);
  }

  openCreateEmployeeModal(): void {
    this.employeeModalMode = 'create';
    this.employeeEditId = null;
    this.employeeModalError = '';
    this.employeeForm.enable();
    this.employeeForm.reset({
      username: '', email: '', password: '', firstName: '', lastName: '', employeeType: 'office_staff', phone: '',
      department: '', jobTitle: '', employeeId: '', companyId: null, officeId: null,
    });
    this.employeeForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.employeeForm.get('password')?.updateValueAndValidity();
    this.officesByCompany = [];
    this.selectedCompanyHasOffices = true;
    this.showEmployeeModal = true;
  }

  openEditEmployeeModal(id: number): void {
    const employee = this.employees.find(e => e.id === id);
    if (!employee) return;
    this.employeeModalMode = 'edit';
    this.employeeEditId = id;
    this.employeeModalError = '';
    this.employeeForm.enable();
    this.employeeForm.reset({
      username: employee.user?.username ?? '',
      email: employee.user?.email ?? '',
      password: '',
      firstName: employee.firstName ?? '',
      lastName: employee.lastName ?? '',
      employeeType: employee.employeeType ?? 'office_staff',
      phone: employee.phone ?? '',
      department: employee.department ?? '',
      jobTitle: employee.jobTitle ?? '',
      employeeId: employee.employeeId ?? '',
      companyId: employee.companyId ?? null,
      officeId: employee.officeId ?? null,
    });
    this.employeeForm.get('password')?.clearValidators();
    this.employeeForm.get('password')?.updateValueAndValidity();
    this.officesByCompany = this.getOfficesForCompany(employee.companyId ?? null);
    this.selectedCompanyHasOffices = this.officesByCompany.length > 0;
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    if (this.employeeModalSubmitting) return;
    this.showEmployeeModal = false;
  }

  submitEmployeeModal(): void {
    if (!this.selectedCompanyHasOffices) {
      this.employeeModalError = 'Selected company has no offices.';
      return;
    }
    if (this.employeeForm.invalid) {
      this.employeeModalError = 'Please fill all required fields, including company and office.';
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.employeeModalSubmitting = true;
    this.employeeModalError = '';
    this.employeeForm.disable({ emitEvent: false });

    const value = this.employeeForm.getRawValue();
    const officeId = this.toPositiveInt(value.officeId);
    if (!officeId) {
      this.employeeModalSubmitting = false;
      this.employeeForm.enable();
      this.employeeModalError = 'Please select a valid office.';
      return;
    }

    if (this.employeeModalMode === 'create') {
      const payload: CreateEmployeeWithUserPayload = {
        username: (value.username ?? '').trim(),
        email: (value.email ?? '').trim(),
        password: value.password ?? '',
        firstName: (value.firstName ?? '').trim(),
        lastName: (value.lastName ?? '').trim(),
        employeeType: value.employeeType ?? 'office_staff',
        phone: (value.phone ?? '').trim() || undefined,
        department: (value.department ?? '').trim() || undefined,
        jobTitle: (value.jobTitle ?? '').trim() || undefined,
        employeeId: (value.employeeId ?? '').trim() || undefined,
        officeId,
      };
      this.usersApi.createEmployeeWithUser(payload).subscribe({
        next: () => {
          this.showEmployeeModal = false;
          this.employeeModalSubmitting = false;
          this.setFeedback('Employee created.', 'success');
          this.reload();
        },
        error: (error) => {
          this.employeeModalSubmitting = false;
          this.employeeForm.enable();
          const msg = error?.error?.message;
          this.employeeModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to create employee.');
        },
      });
      return;
    }

    const updatePayload: UpdateEmployeeWithUserPayload = {
      username: (value.username ?? '').trim(),
      email: (value.email ?? '').trim(),
      firstName: (value.firstName ?? '').trim(),
      lastName: (value.lastName ?? '').trim(),
      employeeType: value.employeeType ?? 'office_staff',
      phone: (value.phone ?? '').trim() || undefined,
      department: (value.department ?? '').trim() || undefined,
      jobTitle: (value.jobTitle ?? '').trim() || undefined,
      employeeId: (value.employeeId ?? '').trim() || undefined,
      officeId,
    };

    this.usersApi.updateEmployee(this.employeeEditId!, updatePayload).subscribe({
      next: () => {
        this.showEmployeeModal = false;
        this.employeeModalSubmitting = false;
        this.setFeedback('Employee updated.', 'success');
        this.reload();
      },
      error: (error) => {
        this.employeeModalSubmitting = false;
        this.employeeForm.enable();
        const msg = error?.error?.message;
        this.employeeModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to update employee.');
      },
    });
  }

  openCreateAdminModal(): void {
    this.adminModalError = '';
    this.adminForm.enable();
    this.adminForm.reset({ username: '', email: '', password: '' });
    this.showAdminModal = true;
  }

  openCreateCustomerModal(): void {
    this.customerModalMode = 'create';
    this.customerEditId = null;
    this.customerModalError = '';
    this.customerForm.enable();
    this.customerForm.reset({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      companyId: null,
    });
    this.customerForm.get('username')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.customerForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.customerForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.customerForm.get('username')?.updateValueAndValidity();
    this.customerForm.get('email')?.updateValueAndValidity();
    this.customerForm.get('password')?.updateValueAndValidity();
    this.showCustomerModal = true;
  }

  openEditCustomerModal(id: number): void {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;
    this.customerModalMode = 'edit';
    this.customerEditId = id;
    this.customerModalError = '';
    this.customerForm.enable();
    this.customerForm.reset({
      username: customer.user?.username ?? '',
      email: customer.user?.email ?? '',
      password: '',
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      zipCode: customer.zipCode ?? '',
      country: customer.country ?? '',
      companyId: customer.companyId ?? null,
    });
    this.customerForm.get('username')?.clearValidators();
    this.customerForm.get('email')?.clearValidators();
    this.customerForm.get('password')?.clearValidators();
    this.customerForm.get('username')?.updateValueAndValidity();
    this.customerForm.get('email')?.updateValueAndValidity();
    this.customerForm.get('password')?.updateValueAndValidity();
    this.showCustomerModal = true;
  }

  closeCustomerModal(): void {
    if (this.customerModalSubmitting) return;
    this.showCustomerModal = false;
  }

  submitCustomerModal(): void {
    if (this.customerForm.invalid) {
      this.customerModalError = 'Please fill all required fields.';
      this.customerForm.markAllAsTouched();
      return;
    }

    this.customerModalSubmitting = true;
    this.customerModalError = '';
    this.customerForm.disable({ emitEvent: false });
    const value = this.customerForm.getRawValue();

    if (this.customerModalMode === 'create') {
      const payload: CreateCustomerWithUserPayload = {
        username: (value.username ?? '').trim(),
        email: (value.email ?? '').trim(),
        password: value.password ?? '',
        firstName: (value.firstName ?? '').trim(),
        lastName: (value.lastName ?? '').trim(),
        phone: (value.phone ?? '').trim() || undefined,
        address: (value.address ?? '').trim() || undefined,
        city: (value.city ?? '').trim() || undefined,
        state: (value.state ?? '').trim() || undefined,
        zipCode: (value.zipCode ?? '').trim() || undefined,
        country: (value.country ?? '').trim() || undefined,
        companyId: value.companyId ?? undefined,
      };
      this.usersApi.createCustomerWithUser(payload).subscribe({
        next: () => {
          this.showCustomerModal = false;
          this.customerModalSubmitting = false;
          this.setFeedback('Customer created.', 'success');
          this.reload();
        },
        error: (error) => {
          this.customerModalSubmitting = false;
          this.customerForm.enable();
          const msg = error?.error?.message;
          this.customerModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to create customer.');
        },
      });
      return;
    }

    const payload: UpdateCustomerPayload = {
      firstName: (value.firstName ?? '').trim(),
      lastName: (value.lastName ?? '').trim(),
      phone: (value.phone ?? '').trim() || undefined,
      address: (value.address ?? '').trim() || undefined,
      city: (value.city ?? '').trim() || undefined,
      state: (value.state ?? '').trim() || undefined,
      zipCode: (value.zipCode ?? '').trim() || undefined,
      country: (value.country ?? '').trim() || undefined,
      companyId: value.companyId ?? undefined,
    };
    this.usersApi.updateCustomer(this.customerEditId!, payload).subscribe({
      next: () => {
        this.showCustomerModal = false;
        this.customerModalSubmitting = false;
        this.setFeedback('Customer updated.', 'success');
        this.reload();
      },
      error: (error) => {
        this.customerModalSubmitting = false;
        this.customerForm.enable();
        const msg = error?.error?.message;
        this.customerModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to update customer.');
      },
    });
  }

  closeAdminModal(): void {
    if (this.adminModalSubmitting) return;
    this.showAdminModal = false;
  }

  submitAdminModal(): void {
    if (this.adminForm.invalid) {
      this.adminModalError = 'Please fill all required fields.';
      this.adminForm.markAllAsTouched();
      return;
    }
    this.adminModalSubmitting = true;
    this.adminModalError = '';
    this.adminForm.disable();
    const value = this.adminForm.getRawValue();
    this.usersApi.createAdmin({
      username: (value.username ?? '').trim(),
      email: (value.email ?? '').trim(),
      password: value.password ?? '',
    }).subscribe({
      next: () => {
        this.showAdminModal = false;
        this.adminModalSubmitting = false;
        this.setFeedback('Admin user created.', 'success');
      },
      error: (error) => {
        this.adminModalSubmitting = false;
        this.adminForm.enable();
        const msg = error?.error?.message;
        this.adminModalError = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to create admin.');
      },
    });
  }

  deleteEmployee(id: number): void {
    if (!confirm('Delete employee and deactivate linked user account?')) {
      return;
    }
    this.usersApi.deleteEmployee(id).subscribe({
      next: () => {
        this.setFeedback('Employee deleted and account deactivated.', 'success');
        this.reload();
      },
      error: () => {
        this.setFeedback('Failed to delete employee.', 'error');
      },
    });
  }

  deleteCustomer(id: number): void {
    if (!confirm('Delete customer profile?')) {
      return;
    }
    this.usersApi.deleteCustomer(id).subscribe({
      next: () => {
        this.setFeedback('Customer deleted.', 'success');
        this.reload();
      },
      error: () => {
        this.setFeedback('Failed to delete customer.', 'error');
      },
    });
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 4000);
  }

  private formatEmployeeType(employeeType?: Employee['employeeType']): string {
    return employeeType === 'courier' ? 'Courier' : 'Office Staff';
  }

  private reload(): void {
    this.companyApi.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.usersApi.getEmployees().subscribe({
          next: (employees) => {
            this.employees = [...employees].sort((a, b) => {
              const left = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
              const right = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
              return left.localeCompare(right);
            });
            this.employeesRowData = this.employees;
          },
          error: () => this.setFeedback('Failed to load employees.', 'error'),
        });
        this.usersApi.getCustomers().subscribe({
          next: (customers) => {
            this.customers = [...customers].sort((a, b) => {
              const left = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
              const right = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
              return left.localeCompare(right);
            });
            this.customersRowData = this.customers;
          },
          error: () => this.setFeedback('Failed to load customers.', 'error'),
        });
      },
      error: () => this.setFeedback('Failed to load companies.', 'error'),
    });
  }

  private getOfficesForCompany(companyId: number | null): Office[] {
    if (!companyId) return [];
    const company = this.companies.find(c => c.id === companyId);
    const offices = [...(company?.offices ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    return offices;
  }

  private toPositiveInt(value: unknown): number | null {
    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return null;
    }
    return parsed;
  }
}
