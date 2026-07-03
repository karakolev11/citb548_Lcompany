import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import {
  ReportsApiService,
  OfficeRevenueItem,
  CompanyRevenueItem,
  CustomerReportItem,
  EmployeeReportItem,
  ShipmentFilters,
} from '../../shared/services/reports-api.service';
import { Shipment } from '../../models/domain.models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent implements OnInit {
  private readonly reportsApi = inject(ReportsApiService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly isAdmin = this.authService.hasAnyRole([1]);
  readonly isBackoffice = this.authService.hasAnyRole([1, 2]);

  shipmentsFilter = this.fb.group({
    status: [''],
    officeId: [null as number | null],
    senderId: [null as number | null],
    receiverId: [null as number | null],
  });

  shipments$!: Observable<Shipment[]>;
  officeRevenue$!: Observable<OfficeRevenueItem[]>;
  companyRevenue$!: Observable<CompanyRevenueItem[]>;
  customers$!: Observable<CustomerReportItem[]>;
  employees$!: Observable<EmployeeReportItem[]>;

  readonly statusOptions = ['', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadShipments();
    if (this.isBackoffice) {
      this.officeRevenue$ = this.reportsApi.getOfficeRevenue();
      this.customers$ = this.reportsApi.getCustomers();
      this.employees$ = this.reportsApi.getEmployees();
    }
    if (this.isAdmin) {
      this.companyRevenue$ = this.reportsApi.getCompanyRevenue();
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
      receiverId: v.receiverId ?? undefined,
    };
    this.shipments$ = this.reportsApi.getShipments(filters);
  }
}
