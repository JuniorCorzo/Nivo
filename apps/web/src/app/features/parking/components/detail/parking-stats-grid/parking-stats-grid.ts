import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ParkingTelemetryModel } from "@core/models/parking-telemetry.model";
import type { Coordinates } from "@core/type/coordinates.type";
import type { OperatingHours } from "@core/type/operating-hours.type";
import type { SlotDistribution } from "@core/type/slot-distribution.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBike,
  lucideCar,
  lucideClock,
  lucideCoins,
  lucideLayers,
  lucideTimer,
} from "@ng-icons/lucide";
import { CardComponent } from "@nivo-sass/design-system";
import { formatCoordinates } from "@shared/utils/coordinates.utils";
import { formatDuration } from "@shared/utils/duration.utils";
import { formatPrice } from "@shared/utils/price.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, NgIcon],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideClock,
      lucideCoins,
      lucideLayers,
      lucideTimer,
    }),
  ],
  selector: "app-parking-stats-grid",
  standalone: true,
  templateUrl: "./parking-stats-grid.html",
})
export class ParkingStatsGrid {
  public readonly totalSlots = input.required<number>();
  public readonly occupiedSlots = input.required<number>();
  public readonly availableSlots = input.required<number>();
  public readonly occupationRate = input.required<number>();
  public readonly currency = input.required<string>();
  public readonly coordinates = input.required<Coordinates>();
  public readonly slotDistribution = input<SlotDistribution[]>([]);
  public readonly operatingHours = input<OperatingHours>();
  public readonly gracePeriodMinutes = input<number>();
  public readonly gracePeriodPrice = input<number>();
  public readonly telemetry = input<ParkingTelemetryModel | null>(null);

  public readonly clampedOccupationRate = computed<number>(() =>
    Math.min(Math.max(this.occupationRate(), 0), 100)
  );

  public readonly formattedCoords = computed<string>(() => {
    const coords = this.coordinates();
    if (!coords) {
      return "";
    }
    return formatCoordinates(coords);
  });

  public readonly carTotal = computed<number>(() => {
    const t = this.telemetry();
    if (t?.carTotal != null) {
      return t.carTotal;
    }
    const dist = this.slotDistribution() ?? [];
    return dist
      .filter((s) => s.type === "CAR")
      .reduce((sum, s) => sum + (s.count || 0), 0);
  });

  public readonly motoTotal = computed<number>(() => {
    const t = this.telemetry();
    if (t?.motoTotal != null) {
      return t.motoTotal;
    }
    const dist = this.slotDistribution() ?? [];
    return dist
      .filter((s) => s.type === "MOTORCYCLE")
      .reduce((sum, s) => sum + (s.count || 0), 0);
  });

  public readonly carOccupied = computed<number>(() => {
    const t = this.telemetry();
    if (t?.carOccupied != null) {
      return t.carOccupied;
    }
    const total = this.totalSlots();
    if (total <= 0 || this.carTotal() <= 0) {
      return 0;
    }
    const ratio = this.occupiedSlots() / total;
    return Math.min(this.carTotal(), Math.round(this.carTotal() * ratio));
  });

  public readonly carRate = computed<number>(() => {
    const t = this.telemetry();
    if (t?.carRate != null) {
      return t.carRate;
    }
    return this.carTotal() > 0
      ? Math.round((this.carOccupied() / this.carTotal()) * 100)
      : 0;
  });

  public readonly motoOccupied = computed<number>(() => {
    const t = this.telemetry();
    if (t?.motoOccupied != null) {
      return t.motoOccupied;
    }
    const total = this.totalSlots();
    if (total <= 0 || this.motoTotal() <= 0) {
      return 0;
    }
    const ratio = this.occupiedSlots() / total;
    return Math.min(this.motoTotal(), Math.round(this.motoTotal() * ratio));
  });

  public readonly motoRate = computed<number>(() => {
    const t = this.telemetry();
    if (t?.motoRate != null) {
      return t.motoRate;
    }
    return this.motoTotal() > 0
      ? Math.round((this.motoOccupied() / this.motoTotal()) * 100)
      : 0;
  });

  public readonly totalZones = computed<number>(() => {
    const dist = this.slotDistribution() ?? [];
    return new Set(dist.map((s) => s.zone).filter(Boolean)).size || dist.length;
  });

  public readonly operatingHoursText = computed<string>(() => {
    const hours = this.operatingHours();
    if (!hours?.openTime || !hours?.closeTime) {
      return "";
    }
    return `${hours.openTime.split("-")[0]} - ${hours.closeTime.split("-")[0]}`;
  });

  public readonly gracePeriodText = computed<string>(() =>
    formatDuration(this.gracePeriodMinutes())
  );

  public readonly gracePeriodPriceText = computed<string>(() =>
    formatPrice(this.gracePeriodPrice())
  );
}
