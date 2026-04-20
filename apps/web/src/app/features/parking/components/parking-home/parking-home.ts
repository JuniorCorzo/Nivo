import { Component } from '@angular/core';
import { ParkingTable } from '../parking-table/parking-table';
import { ButtonComponent, InputComponent, TypographyH3 } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-parking-home',
  imports: [ParkingTable, TypographyH3, ButtonComponent, InputComponent, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideSearch })],
  templateUrl: './parking-home.html',
})
export class ParkingHome {
  protected LABELS = APP_TEXTS.parking;
}
