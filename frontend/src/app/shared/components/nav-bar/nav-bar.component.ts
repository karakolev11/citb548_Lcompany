import { Component } from '@angular/core';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-nav-bar',
  imports: [
    FeatherModule
  ],
  standalone: true,
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  navClass = 'navbar-white-bg';

  public windowScroll(): void {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      document.getElementById("topnav")?.classList.add("nav-sticky");
    } else {
      document.getElementById("topnav")?.classList.remove("nav-sticky");
    }
  }

}
