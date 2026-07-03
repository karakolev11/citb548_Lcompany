import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, Employee } from '../../models/domain.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  constructor(private readonly http: HttpClient) {}

  public getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }

  public createCustomer(payload: {
    firstName: string;
    lastName: string;
    userId: number;
    companyId?: number;
  }): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', payload);
  }

  public deleteCustomer(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/customers/${id}`);
  }

  public getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }

  public createEmployee(payload: {
    firstName: string;
    lastName: string;
    userId: number;
    companyId: number;
  }): Observable<Employee> {
    return this.http.post<Employee>('/api/employees', payload);
  }

  public deleteEmployee(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/employees/${id}`);
  }
}
