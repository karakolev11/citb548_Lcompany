import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, Office } from '../../models/domain.models';

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  constructor(private readonly http: HttpClient) {}

  public getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>('/api/company');
  }

  public createCompany(payload: { name: string }): Observable<Company> {
    return this.http.post<Company>('/api/company', payload);
  }

  public updateCompany(id: number, payload: { name: string }): Observable<Company> {
    return this.http.patch<Company>(`/api/company/${id}`, payload);
  }

  public deleteCompany(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/company/${id}`);
  }

  public getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>('/api/offices');
  }

  public createOffice(payload: { name: string; location: string; orderPrice?: number; companyId?: number }): Observable<Office> {
    return this.http.post<Office>('/api/offices', payload);
  }

  public updateOffice(id: number, payload: Partial<{ name: string; location: string; orderPrice: number; companyId: number }>): Observable<Office> {
    return this.http.patch<Office>(`/api/offices/${id}`, payload);
  }

  public deleteOffice(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/offices/${id}`);
  }
}
