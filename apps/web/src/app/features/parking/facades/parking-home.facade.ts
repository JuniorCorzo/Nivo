import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Injectable()
export class ParkingHomeFacade {
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly activeParkingService = inject(ActiveParkingService);
  private readonly toastService = inject(ToastService, { optional: true });

  readonly isDeleteModalOpen = signal(false);
  readonly selectedParkingId = signal<string | null>(null);

  readonly activeParkingLot = computed<ParkingLotListItemModel | null>(() =>
    this.activeParkingService.activeParkingLot()
  );

  readonly totalSlots = computed(() => {
    const p = this.activeParkingLot();
    if (!p) {
      return 0;
    }
    return (p.slotDistribution ?? []).reduce((sum, s) => sum + s.count, 0);
  });

  readonly occupiedSlots = computed(() =>
    Math.round(
      (this.totalSlots() * (this.activeParkingLot()?.occuppationRate || 0)) /
        100
    )
  );

  readonly availableSlots = computed(() =>
    Math.max(0, this.totalSlots() - this.occupiedSlots())
  );

  onCreateParking(): void {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  onEdit(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.editParkingLots(p.id)]);
  }

  onManageSlots(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(p.id)]);
  }

  onManageRates(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotRates(p.id)]);
  }

  onManageOperations(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotOperations(p.id)]);
  }

  onDeleteClick(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.selectedParkingId.set(p.id);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirm(): void {
    const id = this.selectedParkingId();
    if (!id) {
      return;
    }
    this.parkingService.delete(id).subscribe({
      error: () => {
        this.toastService?.showToast({
          message: APP_TEXTS.parking.messages.errors.notFound,
          type: "error",
        });
        this.closeDeleteModal();
      },
      next: () => {
        this.toastService?.showToast({
          message: APP_TEXTS.parking.messages.deleted,
          type: "success",
        });
        this.closeDeleteModal();
      },
    });
  }

  onDeleteCancel(): void {
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedParkingId.set(null);
  }
}
