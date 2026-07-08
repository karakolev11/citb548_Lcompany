import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Company, Office } from '../../../../models/domain.models';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrl: './employee-modal.component.scss',
})
export class EmployeeModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) mode: 'create' | 'edit' = 'create';
  @Input({ required: true }) submitting = false;
  @Input() error = '';
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) companies: Company[] = [];
  @Input({ required: true }) officesByCompany: Office[] = [];
  @Input({ required: true }) selectedCompanyHasOffices = true;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    this.submitModal.emit();
  }
}
