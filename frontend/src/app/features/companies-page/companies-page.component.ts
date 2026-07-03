import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { Company, Office } from '../../models/domain.models';
import { CompanyApiService } from '../../shared/services/company-api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, ReactiveFormsModule],
  templateUrl: './companies-page.component.html',
})
export class CompaniesPageComponent implements OnInit {
  private readonly companyApi = inject(CompanyApiService);
  private readonly fb = inject(FormBuilder);

  companies$!: Observable<Company[]>;
  offices$!: Observable<Office[]>;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  readonly companyForm = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.reload();
  }

  createCompany(): void {
    if (this.companyForm.invalid) {
      return;
    }

    const name = this.companyForm.value.name?.trim();
    if (!name) {
      return;
    }

    this.companyApi.createCompany({ name }).subscribe(() => {
      this.companyForm.reset();
      this.setFeedback('Company created successfully.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to create company.', 'error');
    });
  }

  deleteCompany(id: number): void {
    this.companyApi.deleteCompany(id).subscribe(() => {
      this.setFeedback('Company deleted.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to delete company.', 'error');
    });
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  private reload(): void {
    this.companies$ = this.companyApi.getCompanies();
    this.offices$ = this.companyApi.getOffices();
  }
}
