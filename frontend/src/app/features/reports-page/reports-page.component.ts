import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import {
  ReportsApiService,
  OfficeRevenueItem,
  CompanyRevenueItem,
  CustomerReportItem,
  EmployeeReportItem,
  RevenuePeriodFilters,
  ShipmentFilters,
} from '../../shared/services/reports-api.service';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { UsersApiService } from '../../shared/services/users-api.service';
import { Customer, Employee, Office, Shipment } from '../../models/domain.models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent implements OnInit {
  private readonly reportsApi = inject(ReportsApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly companyApi = inject(CompanyApiService);
  private readonly usersApi = inject(UsersApiService);

  readonly isAdmin = this.authService.hasAnyRole([1]);
  readonly isBackoffice = this.authService.hasAnyRole([1, 2]);

  shipmentsFilter = this.fb.group({
    status: [''],
    officeId: [null as number | null],
    senderId: [null as number | null],
  });

  reportLookupForm = this.fb.group({
    employeeId: [null as number | null],
    customerId: [null as number | null],
  });

  revenuePeriodForm = this.fb.group({
    from: [''],
    to: [''],
  });

  shipments$!: Observable<Shipment[]>;
  shipmentsByEmployee$!: Observable<Shipment[]>;
  sentButNotReceived$!: Observable<Shipment[]>;
  shipmentsSentByCustomer$!: Observable<Shipment[]>;
  shipmentsReceivedByCustomer$!: Observable<Shipment[]>;
  officeRevenue$!: Observable<OfficeRevenueItem[]>;
  companyRevenue$!: Observable<CompanyRevenueItem[]>;
  customers$!: Observable<CustomerReportItem[]>;
  employeeReportRows: EmployeeReportItem[] = [];
  filteredEmployeeReportRows: EmployeeReportItem[] = [];

  offices: Office[] = [];
  customers: Customer[] = [];
  employees: Employee[] = [];
  selectedEmployeeType: '' | 'courier' | 'office_staff' = '';

  readonly statusOptions = ['', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  readonly employeeTypeOptions: Array<{ value: '' | 'courier' | 'office_staff'; label: string }> = [
    { value: '', label: 'All types' },
    { value: 'office_staff', label: 'Office Staff' },
    { value: 'courier', label: 'Courier' },
  ];

  ngOnInit(): void {
    this.loadShipments();
    this.sentButNotReceived$ = this.reportsApi.getSentButNotReceivedShipments();
    this.shipmentsByEmployee$ = of([]);
    this.shipmentsSentByCustomer$ = of([]);
    this.shipmentsReceivedByCustomer$ = of([]);
    if (this.isBackoffice) {
      this.companyApi.getOffices().subscribe(offices => { this.offices = offices; });
      this.usersApi.getCustomers().subscribe(customers => { this.customers = customers; });
      this.usersApi.getEmployees().subscribe(employees => { this.employees = employees; });
      this.loadRevenueReports();
      this.customers$ = this.reportsApi.getCustomers();
      this.reportsApi.getEmployees().subscribe(rows => {
        this.employeeReportRows = rows;
        this.loadEmployeesReport();
      });
    }
  }

  applyShipmentFilters(): void {
    this.loadShipments();
  }

  private loadShipments(): void {
    const v = this.shipmentsFilter.value;
    const filters: ShipmentFilters = {
      status: v.status || undefined,
      officeId: v.officeId ?? undefined,
      senderId: v.senderId ?? undefined,
    };
    this.shipments$ = this.reportsApi.getShipments(filters);
  }

  applyRevenueFilters(): void {
    this.loadRevenueReports();
  }

  loadEmployeeShipmentReport(): void {
    const employeeId = this.reportLookupForm.value.employeeId ?? null;
    this.shipmentsByEmployee$ = employeeId ? this.reportsApi.getShipmentsByEmployee(employeeId) : of([]);
  }

  loadCustomerShipmentReports(): void {
    const customerId = this.reportLookupForm.value.customerId ?? null;
    if (!customerId) {
      this.shipmentsSentByCustomer$ = of([]);
      this.shipmentsReceivedByCustomer$ = of([]);
      return;
    }

    this.shipmentsSentByCustomer$ = this.reportsApi.getShipmentsSentByCustomer(customerId);
    this.shipmentsReceivedByCustomer$ = this.reportsApi.getShipmentsReceivedByCustomer(customerId);
  }

  shipmentReceiverLabel(shipment: Shipment): string {
    if (shipment.receiverCustomer) {
      return `${shipment.receiverCustomer.firstName} ${shipment.receiverCustomer.lastName}`.trim();
    }
    return shipment.receiverName ?? '—';
  }

  formatEmployeeType(employeeType: EmployeeReportItem['employeeType']): string {
    return employeeType === 'office_staff' ? 'Office Staff' : 'Courier';
  }

  onEmployeeTypeFilterChange(value: string): void {
    this.selectedEmployeeType = (value === 'courier' || value === 'office_staff') ? value : '';
    this.loadEmployeesReport();
  }

  private loadEmployeesReport(): void {
    const employeeType = this.selectedEmployeeType || undefined;
    this.filteredEmployeeReportRows = employeeType
      ? this.employeeReportRows.filter(row => row.employeeType === employeeType)
      : this.employeeReportRows;
  }

  private loadRevenueReports(): void {
    const filters: RevenuePeriodFilters = {
      from: this.revenuePeriodForm.value.from || undefined,
      to: this.revenuePeriodForm.value.to || undefined,
    };

    this.officeRevenue$ = this.reportsApi.getOfficeRevenue(filters);
    if (this.isAdmin) {
      this.companyRevenue$ = this.reportsApi.getCompanyRevenue(filters);
    }
  }
}
