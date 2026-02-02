import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, LoginRequest } from '../models/auth.models';

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
    private readonly http: HttpClient
  ) { }

  public login(payload: LoginRequest): void {
    this.http.post<AuthResponse>('/api/auth/login', payload)
      .subscribe((authResponse: AuthResponse) => {
        this.currentUser$$.next(authResponse.user);
        this.setToken(authResponse.token);
      });
  }

  public logout(): void {
    this.setToken(null);
  }

  private setToken(token?: string | null): void {
    if (token) {
      try { localStorage.setItem('auth_token', token); } catch {}
      this.isLoggedIn$$.next(true);
    } else {
      try { localStorage.removeItem('auth_token'); } catch {}
      this.isLoggedIn$$.next(false);
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token') ?? null;  
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
