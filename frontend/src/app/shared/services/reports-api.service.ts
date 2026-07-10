import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shipment } from '../../models/domain.models';

export interface RevenuePeriodFilters {
  from?: string;
  to?: string;
}

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
  employeeType: 'courier' | 'office_staff';
  jobTitle: string | null;
  department: string | null;
  companyName: string;
}

export interface ShipmentFilters {
  status?: string;
  officeId?: number;
  senderId?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  constructor(private readonly http: HttpClient) {}

  public getShipments(filters: ShipmentFilters = {}): Observable<Shipment[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.officeId != null) params = params.set('officeId', filters.officeId);
    if (filters.senderId != null) params = params.set('senderId', filters.senderId);
    return this.http.get<Shipment[]>('/api/reports/shipments', { params });
  }

  public getShipmentsByEmployee(employeeId: number): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`/api/reports/shipments/by-employee/${employeeId}`);
  }

  public getSentButNotReceivedShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>('/api/reports/shipments/sent-not-received');
  }

  public getShipmentsSentByCustomer(customerId: number): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`/api/reports/shipments/sent-by-customer/${customerId}`);
  }

  public getShipmentsReceivedByCustomer(customerId: number): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`/api/reports/shipments/received-by-customer/${customerId}`);
  }

  public getOfficeRevenue(filters: RevenuePeriodFilters = {}): Observable<OfficeRevenueItem[]> {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<OfficeRevenueItem[]>('/api/reports/office-revenue', { params });
  }

  public getCompanyRevenue(filters: RevenuePeriodFilters = {}): Observable<CompanyRevenueItem[]> {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<CompanyRevenueItem[]>('/api/reports/company-revenue', { params });
  }

  public getCustomers(): Observable<CustomerReportItem[]> {
    return this.http.get<CustomerReportItem[]>('/api/reports/customers');
  }

  public getEmployees(): Observable<EmployeeReportItem[]> {
    return this.http.get<EmployeeReportItem[]>('/api/reports/employees');
  }
}
