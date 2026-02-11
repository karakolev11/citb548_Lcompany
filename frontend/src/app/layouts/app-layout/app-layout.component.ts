import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NavBarComponent } from "../../shared/components/nav-bar/nav-bar.component";

@Component({
  selector: 'app-app-layout',
  imports: [
    RouterOutlet,
    FooterComponent,
    NavBarComponent
],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
  standalone: true
})
export class AppLayoutComponent {

}
