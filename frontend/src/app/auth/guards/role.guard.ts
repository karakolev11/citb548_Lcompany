import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles = route.data['roles'] as number[] | undefined;

    if (!roles || roles.length === 0) {
      return true;
    }

    if (this.authService.hasAnyRole(roles)) {
      return true;
    }

    this.router.navigate(['/app']);
    return false;
  }
}
