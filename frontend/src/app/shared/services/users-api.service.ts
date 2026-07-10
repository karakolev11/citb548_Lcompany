import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, Employee } from '../../models/domain.models';

export interface CreateCustomerWithUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyId?: number;
}

export interface UpdateCustomerPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyId?: number;
}

export interface CreateEmployeeWithUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeType: 'courier' | 'office_staff';
  phone?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  officeId: number;
}

export interface UpdateEmployeeWithUserPayload {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  employeeType?: 'courier' | 'office_staff';
  phone?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  officeId?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  constructor(private readonly http: HttpClient) {}

  public getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }

  public createCustomerWithUser(payload: CreateCustomerWithUserPayload): Observable<Customer> {
    return this.http.post<Customer>('/api/customers/with-user', payload);
  }

  public updateCustomer(id: number, payload: UpdateCustomerPayload): Observable<Customer> {
    return this.http.patch<Customer>(`/api/customers/${id}`, payload);
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
    officeId: number;
  }): Observable<Employee> {
    return this.http.post<Employee>('/api/employees', payload);
  }

  public createEmployeeWithUser(payload: CreateEmployeeWithUserPayload): Observable<Employee> {
    return this.http.post<Employee>('/api/employees/with-user', payload);
  }

  public updateEmployee(id: number, payload: UpdateEmployeeWithUserPayload): Observable<Employee> {
    return this.http.patch<Employee>(`/api/employees/${id}`, payload);
  }

  public deleteEmployee(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/employees/${id}`);
  }

  public createAdmin(payload: { username: string; email: string; password: string }): Observable<{ id: number; username: string; email: string; roleId: number }> {
    return this.http.post<{ id: number; username: string; email: string; roleId: number }>('/api/users/admins', payload);
  }
}
