import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only prepend base URL if the request is not already an absolute URL
    if (!request.url.startsWith('http')) {
      request = request.clone({
        url: `${environment.apiBaseUrl}${request.url}`
      });
    }
    return next.handle(request);
  }
}
