import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, Office } from '../../models/domain.models';

export interface OfficePayload {
  name: string;
  location: string;
  officeSurcharge: number;
  addressSurcharge: number;
  pricePerKg: number;
}

export interface CreateCompanyWithOfficesPayload {
  name: string;
  address: string;
  offices: OfficePayload[];
}

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  constructor(private readonly http: HttpClient) {}

  public getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>('/api/company');
  }

  public createCompany(payload: { name: string; address?: string }): Observable<Company> {
    return this.http.post<Company>('/api/company', payload);
  }

  public createCompanyWithOffices(payload: CreateCompanyWithOfficesPayload): Observable<Company> {
    return this.http.post<Company>('/api/company/with-offices', payload);
  }

  public updateCompany(id: number, payload: { name?: string; address?: string }): Observable<Company> {
    return this.http.patch<Company>(`/api/company/${id}`, payload);
  }

  public deleteCompany(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/company/${id}`);
  }

  public getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>('/api/offices');
  }

  public createOffice(payload: OfficePayload & { companyId: number }): Observable<Office> {
    return this.http.post<Office>('/api/offices', payload);
  }

  public updateOffice(id: number, payload: Partial<OfficePayload>): Observable<Office> {
    return this.http.patch<Office>(`/api/offices/${id}`, payload);
  }

  public deleteOffice(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/offices/${id}`);
  }
}
