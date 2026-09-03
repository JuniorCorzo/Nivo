import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBike,
  lucideBuilding2,
  lucideCalendar,
  lucideCar,
  lucideClock,
  lucideCoins,
  lucideLayers,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePencil,
  lucidePlus,
  lucideShieldCheck,
  lucideSparkles,
  lucideTrash2,
} from '@ng-icons/lucide';
import { ToastService } from '@nivo-sass/design-system';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { SlotDistribution } from '@core/type/slot-distribution.type';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { ParkingService } from '@core/services/parking-service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { DeleteParkingModal } from '@shared/components/delete-parking-modal/delete-parking-modal';
import { ParkingLotSelector } from '../parking-lot-selector/parking-lot-selector';
import { ParkingMapComponent } from '../parking-map/parking-map';

@Component({
  selector: 'app-parking-home-mobile',
  standalone: true,
  imports: [NgIcon, ParkingLotSelector, ParkingMapComponent, DeleteParkingModal],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucidePencil,
      lucideTrash2,
      lucideLogIn,
      lucideCoins,
      lucideParkingSquare,
      lucideMapPin,
      lucideCalendar,
      lucideClock,
      lucideCar,
      lucideBike,
      lucideLayers,
      lucideShieldCheck,
      lucideSparkles,
      lucidePlus,
      lucideBuilding2,
    }),
  ],
  templateUrl: './parking-home-mobile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParkingHomeMobile {
  protected readonly LABELS = APP_TEXTS.parking;
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;
  protected readonly ACTIONS = APP_TEXTS.parking.actions;

  public readonly isDeleteModalOpen = signal(false);
  public readonly selectedParkingId = signal<string | null>(null);

  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly activeParkingService = inject(ActiveParkingService);
  private readonly toastService = inject(ToastService, { optional: true });

  public readonly activeParkingLot = computed<ParkingLotListItemModel | null>(() => {
    return this.activeParkingService.activeParkingLot();
  });

  public readonly totalSlots = computed(() => {
    const p = this.activeParkingLot();
    if (!p) return 0;
    return (p.slotDistribution ?? []).reduce((sum, s) => sum + s.count, 0);
  });

  public readonly occupiedSlots = computed(() => {
    return Math.round((this.totalSlots() * (this.activeParkingLot()?.occuppationRate || 0)) / 100);
  });

  public readonly availableSlots = computed(() => {
    return Math.max(0, this.totalSlots() - this.occupiedSlots());
  });

  public readonly addressLine = computed(() => {
    const p = this.activeParkingLot();
    if (!p || !p.address) return '';
    const { street, city, state } = p.address;
    return [street, city, state].filter(Boolean).join(', ');
  });

  public readonly addressSubline = computed(() => {
    const p = this.activeParkingLot();
    if (!p || !p.address) return '';
    const { country, zipCode } = p.address;
    return [country, zipCode].filter(Boolean).join(' · ');
  });

  public readonly formattedCoords = computed(() => {
    const p = this.activeParkingLot();
    if (!p || !p.coordinates) return '';
    return `${p.coordinates.latitude}, ${p.coordinates.longitude}`;
  });

  public readonly slotLabel = (slot: SlotDistribution): string => {
    return [slot.zone, slot.type].filter(Boolean).join(' · ').toUpperCase();
  };

  public onCreateParking(): void {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  public onEdit(): void {
    const p = this.activeParkingLot();
    if (!p) return;
    this.router.navigate([APP_ROUTES.app.editParkingLots(p.id)]);
  }

  public onManageSlots(): void {
    const p = this.activeParkingLot();
    if (!p) return;
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(p.id)]);
  }

  public onManageRates(): void {
    const p = this.activeParkingLot();
    if (!p) return;
    this.router.navigate([APP_ROUTES.app.parkingLotRates(p.id)]);
  }

  public onManageOperations(): void {
    const p = this.activeParkingLot();
    if (!p) return;
    this.router.navigate([APP_ROUTES.app.parkingLotOperations(p.id)]);
  }

  public onDeleteClick(): void {
    const p = this.activeParkingLot();
    if (!p) return;
    this.selectedParkingId.set(p.id);
    this.isDeleteModalOpen.set(true);
  }

  public onDeleteConfirm(): void {
    const id = this.selectedParkingId();
    if (!id) return;
    this.parkingService.delete(id).subscribe({
      next: () => {
        this.toastService?.showToast({
          type: 'success',
          message: APP_TEXTS.parking.messages.deleted,
        });
        this.closeDeleteModal();
      },
      error: () => {
        this.toastService?.showToast({
          type: 'error',
          message: APP_TEXTS.parking.messages.errors.notFound,
        });
        this.closeDeleteModal();
      },
    });
  }

  public onDeleteCancel(): void {
    this.closeDeleteModal();
  }

  public closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedParkingId.set(null);
  }
}
