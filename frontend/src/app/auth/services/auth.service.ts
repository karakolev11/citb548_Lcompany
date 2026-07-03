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

  private readonly currentUser$$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(this.getStoredUser());
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
        this.setCurrentUser(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      }),
      catchError((error) => {
        this.setCurrentUser(null);
        this.setToken(null);
        return throwError(() => error);
      })
    );
  }

  public register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((authResponse) => {
        this.setCurrentUser(authResponse.user);
        this.setToken(authResponse.access_token);
        this.router.navigate(['/app']);
      }),
      catchError((error) => {
        this.setCurrentUser(null);
        this.setToken(null);
        return throwError(() => error);
      })
    );
  }

  public logout(): void {
    this.setToken(null);
    this.setCurrentUser(null);
    this.router.navigate(['/auth/login']);
  }

  public getCurrentUser(): User | null {
    return this.currentUser$$.value;
  }

  public hasAnyRole(roleIds: number[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    return roleIds.includes(user.roleId);
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

  private setCurrentUser(user: User | null): void {
    this.currentUser$$.next(user);
    try {
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('current_user');
      }
    } catch {}
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
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
    // Prevent guard redirect loops when token exists but local user context is missing.
    return !!this.getToken() && !!this.getCurrentUser();
  }

  public getAccessToken(): string | null {
    return this.getToken();
  }
}
