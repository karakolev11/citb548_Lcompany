import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

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

        return next(req);
      }])
    ),
    importProvidersFrom(FeatherModule.pick(allIcons))
  ]
};
