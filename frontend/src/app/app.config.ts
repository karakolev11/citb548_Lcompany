import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([(req, next) => {
        if (!req.url.startsWith('http')) {
          req = req.clone({
            url: `${environment.apiBaseUrl}${req.url}`
          });
        }
        return next(req);
      }])
    ),
    importProvidersFrom(FeatherModule.pick(allIcons))
  ]
};
