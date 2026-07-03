import { Component, inject } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    FeatherModule,
    RouterLink,
    NgIf,
  ],
  standalone: true,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  private readonly authService = inject(AuthService);

  navClass = 'navbar-white-bg';

  public canAccessBackoffice(): boolean {
    return this.authService.hasAnyRole([1, 2]);
  }

  public logout(): void {
    this.authService.logout();
  }

  public windowScroll(): void {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      document.getElementById("topnav")?.classList.add("nav-sticky");
    } else {
      document.getElementById("topnav")?.classList.remove("nav-sticky");
    }
  }

}
