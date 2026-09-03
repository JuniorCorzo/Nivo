import type { ConnectedPosition } from "@angular/cdk/overlay";
import { OverlayModule } from "@angular/cdk/overlay";
import type { ElementRef } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideCheck,
  lucideChevronDown,
  lucideMapPin,
  lucideParkingSquare,
  lucidePlus,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OverlayModule,
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCheck,
      lucideChevronDown,
      lucideMapPin,
      lucideParkingSquare,
      lucidePlus,
    }),
  ],
  selector: "app-parking-lot-selector",
  standalone: true,
  templateUrl: "./parking-lot-selector.html",
})
export class ParkingLotSelector {
  public readonly activeParkingService = inject(ActiveParkingService);
  public readonly parkingService = inject(ParkingService);
  private readonly router = inject(Router, { optional: true });

  public readonly variant = input<"default" | "title">("default");
  public readonly placeholder = input<string>("Seleccionar sede");
  public readonly disabled = input<boolean>(false);
  public readonly size = input<"sm" | "default" | "lg">("default");
  public readonly showCapacity = input<boolean>(true);

  public readonly parkingChange = output<ParkingLotListItemModel>();

  public readonly isOpen = signal<boolean>(false);
  private readonly originElement = viewChild<ElementRef<HTMLElement>>("origin");

  public readonly parkingLots = computed<ParkingLotListItemModel[]>(
    () => this.parkingService.parkingLots() ?? []
  );

  public readonly hasMultipleLots = computed<boolean>(
    () => this.parkingLots().length > 1
  );

  public readonly activeLot = computed<ParkingLotListItemModel | null>(() =>
    this.activeParkingService.activeParkingLot()
  );

  public readonly activeAddress = computed<string>(() => {
    const lot = this.activeLot();
    return lot ? this.getFormattedAddress(lot) : "";
  });

  public readonly overlayWidth = computed<number>(() => {
    const minW = this.variant() === "title" ? 280 : 240;
    return Math.max(this.originElement()?.nativeElement.offsetWidth ?? 0, minW);
  });

  public readonly overlayPositions: ConnectedPosition[] = [
    {
      offsetY: 4,
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
    {
      offsetY: -4,
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
    },
  ];

  public toggleOpen(): void {
    if (
      this.disabled() ||
      (this.variant() === "title" && !this.hasMultipleLots())
    ) {
      return;
    }
    this.isOpen.update((v) => !v);
  }

  public close(): void {
    this.isOpen.set(false);
  }

  public selectParkingLot(lot: ParkingLotListItemModel): void {
    if (this.disabled()) {
      return;
    }
    this.activeParkingService.setActiveParking(lot);
    this.parkingChange.emit(lot);
    this.close();
  }

  public isSelected(lot: ParkingLotListItemModel): boolean {
    return this.activeLot()?.id === lot.id;
  }

  public onCreateParking(): void {
    this.close();
    this.router?.navigate([APP_ROUTES.app.createParkingLots]);
  }

  public static getFormattedAddress(lot: ParkingLotListItemModel): string {
    const { street, city } = lot.address ?? {};
    return [street, city].filter(Boolean).join(", ");
  }

  public readonly getFormattedAddress = ParkingLotSelector.getFormattedAddress;
}
