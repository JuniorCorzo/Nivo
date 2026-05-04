import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucidePencil,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ToastService,
  TypographyMuted,
  TypographyMono,
} from '@nivo-sass/design-system';
import { ParkingService } from '@core/services/parking-service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ParkingMapComponent } from '../parking-map/parking-map';
import { SlotDistribution } from '@core/type/slot-distribution.type';
import { DeleteParkingModal } from '@shared/components/delete-parking-modal/delete-parking-modal';
import { exhaustMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-parking-detail',
  standalone: true,
  imports: [
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    TypographyMuted,
    TypographyMono,
    ParkingMapComponent,
    DeleteParkingModal,
  ],
  providers: [
    provideIcons({ lucideArrowLeft, lucidePencil, lucideTrash2 }),
  ],
  templateUrl: './parking-detail.html',
  styleUrl: './parking-detail.css',
})
export class ParkingDetail {
  protected readonly LABELS = APP_TEXTS.parking.detail;
  protected readonly ACTIONS = APP_TEXTS.parking.actions;

  protected readonly isDeleteModalOpen = signal(false);
  protected readonly selectedParkingId = signal<string | null>(null);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly parkingService = inject(ParkingService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly parkingId = this.route.snapshot.paramMap.get('parkingId');

  constructor() {
    this.parkingService.delete$
      .pipe(
        exhaustMap((id) => this.parkingService.delete(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toastService.showToast({
            message: APP_TEXTS.parking.messages.deleted,
            type: 'success',
          });
          this.goBack();
        },
        error: () => {
          this.toastService.showToast({
            message: APP_TEXTS.server.errors.generic,
            type: 'error',
          });
        },
      });
  }

  protected readonly parking = computed(() => {
    const id = this.parkingId;
    if (!id) return null;
    const list = this.parkingService.parkingLots();
    return list.find((p) => p.id === id) ?? null;
  });

  protected readonly totalSlots = computed(() => {
    const p = this.parking();
    if (!p) return 0;
    return p.slotDistribution.reduce((sum, s) => sum + s.count, 0);
  });

  protected readonly addressLine = computed(() => {
    const p = this.parking();
    if (!p) return '';
    const { street, city, state } = p.address;
    return [street, city, state].filter(Boolean).join(', ');
  });

  protected readonly addressSubline = computed(() => {
    const p = this.parking();
    if (!p) return '';
    const { city, country, zipCode } = p.address;
    return [city, country, zipCode].filter(Boolean).join(' · ');
  });

  protected readonly formattedCoords = computed(() => {
    const p = this.parking();
    if (!p) return '';
    return `${p.coordinates.latitude}, ${p.coordinates.longitude}`;
  });

  protected readonly slotLabel = (slot: SlotDistribution): string => {
    return [slot.zone, slot.type].filter(Boolean).join(' · ').toUpperCase();
  };

  protected readonly formattedDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} · ${hours}:${minutes}`;
  };

  protected goBack(): void {
    this.router.navigate([APP_ROUTES.app.parkingLots]);
  }

  protected onEdit(): void {
    const p = this.parking();
    if (!p) return;
    this.router.navigate([APP_ROUTES.app.editParkingLots(p.id)]);
  }

  protected onDeleteClick(): void {
    const p = this.parking();
    if (!p) return;
    this.selectedParkingId.set(p.id);
    this.isDeleteModalOpen.set(true);
  }

  protected onDeleteConfirm(): void {
    const id = this.selectedParkingId();
    if (!id) return;

    this.parkingService.requestDelete(id);
    this.closeDeleteModal();
  }

  protected onDeleteCancel(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedParkingId.set(null);
  }
}
