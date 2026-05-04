import { Component, inject, signal } from '@angular/core';
import { ParkingTable } from '../parking-table/parking-table';
import { ButtonComponent, InputComponent, TypographyH3 } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@/app/shared/constants/app-routes.constant';

@Component({
  selector: 'app-parking-home',
  imports: [ParkingTable, TypographyH3, ButtonComponent, InputComponent, NgIcon],
  providers: [provideIcons({ lucidePlus, lucideSearch })],
  templateUrl: './parking-home.html',
})
export class ParkingHome {
  protected LABELS = APP_TEXTS.parking;
  protected searchQuery = signal('');
  private router = inject(Router);

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onCreateParking() {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }
}
