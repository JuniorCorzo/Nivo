import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePlus,
  lucideSearch,
} from '@ng-icons/lucide';
import {
  ButtonComponent,
  InputComponent,
  TypographyH3,
  TypographyMuted,
} from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { ParkingTable } from '../parking-table/parking-table';
import { ParkingLotSelector } from '../parking-lot-selector/parking-lot-selector';

@Component({
  selector: 'app-parking-home',
  standalone: true,
  imports: [
    ParkingTable,
    ParkingLotSelector,
    TypographyH3,
    TypographyMuted,
    ButtonComponent,
    InputComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideSearch,
      lucideParkingSquare,
      lucideMapPin,
      lucideLogIn,
      lucideBuilding2,
    }),
  ],
  templateUrl: './parking-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParkingHome {
  protected readonly LABELS = APP_TEXTS.parking;
  protected readonly searchQuery = signal('');

  private readonly router = inject(Router);
  private readonly activeParkingService = inject(ActiveParkingService);

  public readonly activeParkingLot = computed(() => {
    return this.activeParkingService.activeParkingLot();
  });

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onCreateParking(): void {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  protected onManageActiveOperations(): void {
    const lot = this.activeParkingLot();
    if (lot) {
      this.router.navigate([APP_ROUTES.app.parkingLotOperations(lot.id)]);
    }
  }
}
