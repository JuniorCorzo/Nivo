import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlus, lucideSearch, lucideTrash2 } from '@ng-icons/lucide';
import { ParkingService } from '@core/services/parking-service';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { OccuppationMeter } from '../occuppation-meter/occuppation-meter';

@Component({
  selector: 'app-parking-home-mobile',
  imports: [NgIcon, OccuppationMeter],
  providers: [provideIcons({ lucidePlus, lucideSearch, lucideEye, lucidePencil, lucideTrash2 })],
  templateUrl: './parking-home-mobile.html',
})
export class ParkingHomeMobile {
  private readonly parkingService = inject(ParkingService);
  private readonly router = inject(Router);

  protected readonly LABELS = APP_TEXTS.parking;
  protected readonly searchQuery = signal('');

  protected readonly parkingLots = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const lots = this.parkingService.parkingLots();
    if (!query) return lots;
    return lots.filter((p) => p.name.toLowerCase().includes(query));
  });

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onCreateParking(): void {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  protected onEditParking(id: string): void {
    this.router.navigate([APP_ROUTES.app.editParkingLots(id)]);
  }

  protected onViewParking(id: string): void {
    this.router.navigate([APP_ROUTES.app.parkingLots, id]);
  }

  protected getAddress(lot: ParkingLotListItemModel): string {
    const { street, city } = lot.address;
    return [street, city].filter(Boolean).join(', ');
  }

  protected toString(number: number): string {
    return String(number);
  }
}
