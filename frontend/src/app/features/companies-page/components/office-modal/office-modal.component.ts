import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-office-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './office-modal.component.html',
  styleUrl: './office-modal.component.scss',
})
export class OfficeModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) mode: 'add' | 'edit' = 'add';
  @Input({ required: true }) submitting = false;
  @Input() error = '';
  @Input() companyName = '';
  @Input({ required: true }) form!: FormGroup;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    this.submitModal.emit();
  }
}
