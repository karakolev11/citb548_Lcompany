import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../models/auth.models';

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

  public login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', payload).pipe(
      tap((authResponse) => {
        this.currentUser$$.next(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      }),
      catchError((error) => {
        this.currentUser$$.next(null);
        this.setToken(null);
        return throwError(() => error);
      })
    );
  }

  public register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((authResponse) => {
        this.currentUser$$.next(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      }),
      catchError((error) => {
        this.currentUser$$.next(null);
        this.setToken(null);
        return throwError(() => error);
      })
    );
  }

  public logout(): void {
    this.setToken(null);
    this.currentUser$$.next(null);
    this.router.navigate(['/auth/login']);
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
    try {
      return localStorage.getItem('access_token') ?? null;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getAccessToken(): string | null {
    return this.getToken();
  }
}
