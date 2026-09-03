import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideLogIn,
  lucideMapPin,
  lucideParkingSquare,
  lucidePencil,
  lucideTrash2,
} from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  ToastService,
  TypographyH3,
} from "@nivo-sass/design-system";
import { DeleteParkingModal } from "@shared/components/delete-parking-modal/delete-parking-modal";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingEmptyState } from "../parking-empty-state/parking-empty-state";
import { ParkingGeneralInfo } from "../parking-general-info/parking-general-info";
import { ParkingLotSelector } from "../parking-lot-selector/parking-lot-selector";
import { ParkingMapComponent } from "../parking-map/parking-map";
import { ParkingSlotDistribution } from "../parking-slot-distribution/parking-slot-distribution";
import { ParkingStatsGrid } from "../parking-stats-grid/parking-stats-grid";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    ButtonComponent,
    CardComponent,
    TypographyH3,
    ParkingLotSelector,
    ParkingMapComponent,
    DeleteParkingModal,
    ParkingStatsGrid,
    ParkingGeneralInfo,
    ParkingSlotDistribution,
    ParkingEmptyState,
  ],
  providers: [
    provideIcons({
      lucideCoins,
      lucideLogIn,
      lucideMapPin,
      lucideParkingSquare,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  selector: "app-parking-home",
  standalone: true,
  templateUrl: "./parking-home.html",
})
export class ParkingHome {
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;

  public readonly isDeleteModalOpen = signal(false);
  public readonly selectedParkingId = signal<string | null>(null);

  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly activeParkingService = inject(ActiveParkingService);
  private readonly toastService = inject(ToastService, { optional: true });

  public readonly activeParkingLot = computed<ParkingLotListItemModel | null>(
    () => this.activeParkingService.activeParkingLot()
  );

  public readonly totalSlots = computed(() => {
    const p = this.activeParkingLot();
    if (!p) {
      return 0;
    }
    return (p.slotDistribution ?? []).reduce((sum, s) => sum + s.count, 0);
  });

  public readonly occupiedSlots = computed(() =>
    Math.round(
      (this.totalSlots() * (this.activeParkingLot()?.occuppationRate || 0)) /
        100
    )
  );

  public readonly availableSlots = computed(() =>
    Math.max(0, this.totalSlots() - this.occupiedSlots())
  );

  public onCreateParking(): void {
    this.router.navigate([APP_ROUTES.app.createParkingLots]);
  }

  public onEdit(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.editParkingLots(p.id)]);
  }

  public onManageSlots(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(p.id)]);
  }

  public onManageRates(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotRates(p.id)]);
  }

  public onManageOperations(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotOperations(p.id)]);
  }

  public onDeleteClick(): void {
    const p = this.activeParkingLot();
    if (!p) {
      return;
    }
    this.selectedParkingId.set(p.id);
    this.isDeleteModalOpen.set(true);
  }

  public onDeleteConfirm(): void {
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

  public onDeleteCancel(): void {
    this.closeDeleteModal();
  }

  public closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedParkingId.set(null);
  }
}
