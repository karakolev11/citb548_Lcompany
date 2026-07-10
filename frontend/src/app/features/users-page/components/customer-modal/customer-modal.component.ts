import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Company } from '../../../../models/domain.models';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-modal.component.html',
  styleUrl: './customer-modal.component.scss',
})
export class CustomerModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) mode: 'create' | 'edit' = 'create';
  @Input({ required: true }) submitting = false;
  @Input() error = '';
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) companies: Company[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    this.submitModal.emit();
  }
}