import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shipment } from '../../models/domain.models';

export interface OfficeRevenueItem {
  officeId: number;
  officeName: string;
  companyId: number;
  companyName: string;
  shipmentCount: number;
  revenue: number;
}

export interface CompanyRevenueItem {
  companyId: number;
  companyName: string;
  officeCount: number;
  totalRevenue: number;
}

export interface CustomerReportItem {
  customerId: number;
  firstName: string;
  lastName: string;
  companyName: string | null;
  sentCount: number;
  receivedCount: number;
}

export interface EmployeeReportItem {
  employeeId: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: string | null;
  companyName: string;
}

export interface ShipmentFilters {
  status?: string;
  officeId?: number;
  senderId?: number;
  receiverId?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  constructor(private readonly http: HttpClient) {}

  public getShipments(filters: ShipmentFilters = {}): Observable<Shipment[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.officeId != null) params = params.set('officeId', filters.officeId);
    if (filters.senderId != null) params = params.set('senderId', filters.senderId);
    if (filters.receiverId != null) params = params.set('receiverId', filters.receiverId);
    return this.http.get<Shipment[]>('/api/reports/shipments', { params });
  }

  public getOfficeRevenue(): Observable<OfficeRevenueItem[]> {
    return this.http.get<OfficeRevenueItem[]>('/api/reports/office-revenue');
  }

  public getCompanyRevenue(): Observable<CompanyRevenueItem[]> {
    return this.http.get<CompanyRevenueItem[]>('/api/reports/company-revenue');
  }

  public getCustomers(): Observable<CustomerReportItem[]> {
    return this.http.get<CustomerReportItem[]>('/api/reports/customers');
  }

  public getEmployees(): Observable<EmployeeReportItem[]> {
    return this.http.get<EmployeeReportItem[]>('/api/reports/employees');
  }
}
