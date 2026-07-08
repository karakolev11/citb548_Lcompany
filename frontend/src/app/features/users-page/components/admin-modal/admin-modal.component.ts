import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss',
})
export class AdminModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) submitting = false;
  @Input() error = '';
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
