import { Component } from '@angular/core';
import { year } from '../../../utils/consts';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FeatherModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  year = year;
}
