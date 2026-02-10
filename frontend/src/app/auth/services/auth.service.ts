import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthResponse, LoginRequest } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUser$$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private readonly isLoggedIn$$ = new BehaviorSubject<boolean>(!!this.getToken());

  get currentUser$(): Observable<User | null> {
    return this.currentUser$$.asObservable();
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedIn$$.asObservable();
  }

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) { }

  public login(payload: LoginRequest): void {
    this.http.post<AuthResponse>('/api/auth/login', payload)
      .subscribe((authResponse) => {
        console.log('Login successful:', authResponse);
        this.currentUser$$.next(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      });
  }

  public register(payload: any): void {
    this.http.post<AuthResponse>('/api/auth/register', payload)
      .subscribe((authResponse) => {
        console.log('Register successful:', authResponse);
        this.currentUser$$.next(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      });
  }

  public logout(): void {
    this.setToken(null);
  }

  private setToken(token?: string | null): void {
    if (token) {
      try { localStorage.setItem('access_token', token); } catch {}
      this.isLoggedIn$$.next(true);
    } else {
      try { localStorage.removeItem('access_token'); } catch {}
      this.isLoggedIn$$.next(false);
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token') ?? null;  
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
