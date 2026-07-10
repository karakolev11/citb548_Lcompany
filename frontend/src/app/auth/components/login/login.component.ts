
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LoginRequest } from '../../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { year } from '../../../utils/consts';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterLink,
    CommonModule
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  year = year;
  authError: string | null = null;

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  constructor(
    private readonly authService: AuthService
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authError = null;
    const payload: LoginRequest = this.form.value as LoginRequest;
    this.authService.login(payload).subscribe({
      error: (error: HttpErrorResponse) => {
        this.authError = error.error?.message ?? 'Unable to sign in. Please try again.';
        this.form.reset({ username: '', password: '' });
      }
    });
  }
}
