import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { combineLatest, map, Observable } from 'rxjs';
import { Company, Employee, Shipment } from '../../models/domain.models';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { UsersApiService } from '../../shared/services/users-api.service';
import { ShipmentsApiService } from '../../shared/services/shipments-api.service';

interface ReportsSummary {
  companiesCount: number;
  employeesCount: number;
  shipmentsCount: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent implements OnInit {
  private readonly companyApi = inject(CompanyApiService);
  private readonly usersApi = inject(UsersApiService);
  private readonly shipmentsApi = inject(ShipmentsApiService);

  summary$!: Observable<ReportsSummary>;

  ngOnInit(): void {
    this.summary$ = combineLatest([
      this.companyApi.getCompanies(),
      this.usersApi.getEmployees(),
      this.shipmentsApi.getShipments(),
    ]).pipe(
      map(([companies, employees, shipments]: [Company[], Employee[], Shipment[]]) => ({
        companiesCount: companies.length,
        employeesCount: employees.length,
        shipmentsCount: shipments.length,
        totalRevenue: shipments.reduce((sum, s) => sum + Number(s.orderPriceSnapshot ?? 0), 0),
      })),
    );
  }
}
