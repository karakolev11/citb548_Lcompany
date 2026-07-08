import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-modal.component.html',
  styleUrl: './company-modal.component.scss',
})
export class CompanyModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) mode: 'create' | 'edit' = 'create';
  @Input({ required: true }) submitting = false;
  @Input() error = '';
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) offices!: FormArray;
  @Input({ required: true }) duplicateOfficeName = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<void>();
  @Output() addOffice = new EventEmitter<void>();
  @Output() removeOffice = new EventEmitter<number>();

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    this.submitModal.emit();
  }

  addOfficeRow(): void {
    this.addOffice.emit();
  }

  removeOfficeRow(index: number): void {
    this.removeOffice.emit(index);
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }
}
