import type { ConnectedPosition } from "@angular/cdk/overlay";
import { OverlayModule } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideCheck,
  lucideChevronsUpDown,
  lucideSettings,
} from "@ng-icons/lucide";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { UserMenu } from "../user-menu/user-menu";

export const SEDE_SWITCHER_OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    offsetY: -8,
    originX: "start",
    originY: "top",
    overlayX: "start",
    overlayY: "bottom",
  },
  {
    offsetY: -8,
    originX: "end",
    originY: "top",
    overlayX: "end",
    overlayY: "bottom",
  },
  {
    offsetX: 8,
    originX: "end",
    originY: "center",
    overlayX: "start",
    overlayY: "center",
  },
  {
    offsetY: 8,
    originX: "start",
    originY: "bottom",
    overlayX: "start",
    overlayY: "top",
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, OverlayModule, NgIcon, UserMenu],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCheck,
      lucideChevronsUpDown,
      lucideSettings,
    }),
  ],
  selector: "app-sidebar-footer",
  styleUrl: "./sidebar-footer.css",
  templateUrl: "./sidebar-footer.html",
})
export class SidebarFooter {
  readonly collapsed = input(false);
  readonly isOpen = signal(false);

  private readonly router = inject(Router);
  private readonly activeParkingService = inject(ActiveParkingService, {
    optional: true,
  });
  private readonly parkingService = inject(ParkingService, {
    optional: true,
  });

  readonly parkingLotsUrl = APP_ROUTES.app.parkingLots;
  readonly overlayPositions = SEDE_SWITCHER_OVERLAY_POSITIONS;

  readonly parkingLots = computed<ParkingLotListItemModel[]>(
    () => this.parkingService?.parkingLots?.() ?? []
  );

  readonly activeParkingLot = computed(
    () => this.activeParkingService?.activeParkingLot?.() ?? null
  );

  readonly activeParkingName = computed(
    () =>
      this.activeParkingLot()?.name ??
      this.activeParkingService?.activeParkingName?.() ??
      ""
  );

  readonly capacityLabel = computed(() => {
    const lot = this.activeParkingLot();
    return lot ? `${lot.totalCapacity ?? 0} Plazas` : "Sin sede";
  });

  formatAddress(lot: ParkingLotListItemModel): string {
    if (!lot) {
      return "";
    }
    if (typeof (lot.address as unknown) === "string") {
      return lot.address as unknown as string;
    }
    if (lot.address && typeof lot.address === "object") {
      const parts = [lot.address.street, lot.address.city].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    return `${lot.totalCapacity ?? 0} Plazas`;
  }

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  selectParkingLot(lot: ParkingLotListItemModel): void {
    this.activeParkingService?.setActiveParking(lot);
    this.close();

    const currentUrl = this.router.url.split("?", 1)[0];
    const match = currentUrl.match(/^\/app\/parking-lots\/([^/]+)(\/.*)?$/);
    if (match && match[1] !== "create") {
      const subPath = match[2] ?? "";
      void this.router.navigateByUrl(`/app/parking-lots/${lot.id}${subPath}`);
    }
  }

  @HostListener("window:keydown", ["$event"])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.isOpen()) {
      this.close();
    }
  }
}
