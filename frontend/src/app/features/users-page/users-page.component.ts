import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { Customer, Employee } from '../../models/domain.models';
import { UsersApiService } from '../../shared/services/users-api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, ReactiveFormsModule],
  templateUrl: './users-page.component.html',
})
export class UsersPageComponent implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly fb = inject(FormBuilder);

  customers$!: Observable<Customer[]>;
  employees$!: Observable<Employee[]>;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  readonly customerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userId: [0, Validators.required],
    companyId: [null as number | null],
  });

  readonly employeeForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userId: [0, Validators.required],
    companyId: [0, Validators.required],
  });

  ngOnInit(): void {
    this.reload();
  }

  createCustomer(): void {
    if (this.customerForm.invalid) {
      return;
    }
    const value = this.customerForm.getRawValue();
    this.usersApi.createCustomer({
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      userId: Number(value.userId),
      companyId: value.companyId ?? undefined,
    }).subscribe(() => {
      this.customerForm.reset({ firstName: '', lastName: '', userId: 0, companyId: null });
      this.setFeedback('Customer created successfully.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to create customer.', 'error');
    });
  }

  deleteCustomer(id: number): void {
    this.usersApi.deleteCustomer(id).subscribe(() => {
      this.setFeedback('Customer deleted.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to delete customer.', 'error');
    });
  }

  createEmployee(): void {
    if (this.employeeForm.invalid) {
      return;
    }
    const value = this.employeeForm.getRawValue();
    this.usersApi.createEmployee({
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      userId: Number(value.userId),
      companyId: Number(value.companyId),
    }).subscribe(() => {
      this.employeeForm.reset({ firstName: '', lastName: '', userId: 0, companyId: 0 });
      this.setFeedback('Employee created successfully.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to create employee.', 'error');
    });
  }

  deleteEmployee(id: number): void {
    this.usersApi.deleteEmployee(id).subscribe(() => {
      this.setFeedback('Employee deleted.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to delete employee.', 'error');
    });
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  private reload(): void {
    this.customers$ = this.usersApi.getCustomers();
    this.employees$ = this.usersApi.getEmployees();
  }
}
