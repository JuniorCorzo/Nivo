import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ParkingTable } from '../parking-table/parking-table';
import { ButtonComponent, InputComponent, ToastService, TypographyH3 } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSearch } from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@/app/shared/constants/app-routes.constant';
import { ParkingService } from '@core/services/parking-service';
import { DeleteParkingModal } from '@shared/components/delete-parking-modal/delete-parking-modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { exhaustMap } from 'rxjs/operators';

@Component({
  selector: 'app-parking-home',
  imports: [ParkingTable, TypographyH3, ButtonComponent, InputComponent, NgIcon, DeleteParkingModal],
  providers: [provideIcons({ lucidePlus, lucideSearch })],
  templateUrl: './parking-home.html',
})
export class ParkingHome {
  protected LABELS = APP_TEXTS.parking;
  protected searchQuery = signal('');
  protected isDeleteModalOpen = signal(false);
  protected selectedParkingId = signal<string | null>(null);

  private router = inject(Router);
  private parkingService = inject(ParkingService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.parkingService.delete$
      .pipe(exhaustMap((id) => this.parkingService.delete(id)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showToast({
            message: APP_TEXTS.parking.messages.deleted,
            type: 'success',
          });
        },
        error: () => {
          this.toastService.showToast({
            message: APP_TEXTS.server.errors.generic,
            type: 'error',
          });
        },
      });
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onCreateParking() {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  protected onDeleteClick(id: string): void {
    this.selectedParkingId.set(id);
    this.isDeleteModalOpen.set(true);
  }

  protected onDeleteConfirm(): void {
    const id = this.selectedParkingId();
    if (id) {
      this.parkingService.requestDelete(id);
    }
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
