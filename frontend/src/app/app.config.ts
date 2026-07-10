import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([(req, next) => {
        const authService = inject(AuthService);
        const token = authService.getAccessToken();

        if (!req.url.startsWith('http')) {
          req = req.clone({
            url: `${environment.apiBaseUrl}${req.url}`
          });
        }

        if (token && req.url.includes('/api/')) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        return next(req).pipe(
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/auth/login')) {
              authService.logout();
            }
            return throwError(() => error);
          })
        );
      }])
    ),
    importProvidersFrom(FeatherModule.pick(allIcons))
  ]
};
