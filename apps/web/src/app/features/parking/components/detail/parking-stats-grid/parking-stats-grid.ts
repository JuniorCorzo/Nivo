import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { Coordinates } from "@core/type/coordinates.type";
import { CardComponent } from "@nivo-sass/design-system";
import { formatCoordinates } from "@shared/utils/coordinates.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CardComponent],
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

  public readonly carTotal = computed<number>(
    () => Math.round(this.totalSlots() * 0.6) || 30
  );

  public readonly carOccupied = computed<number>(() =>
    Math.min(
      this.carTotal(),
      Math.round(this.occupiedSlots() * 0.65) ||
        (this.occupiedSlots() > 0 ? Math.min(this.occupiedSlots(), 24) : 0)
    )
  );

  public readonly carRate = computed<number>(() =>
    this.carTotal() > 0
      ? Math.round((this.carOccupied() / this.carTotal()) * 100)
      : 80
  );

  public readonly motoTotal = computed<number>(
    () => Math.max(0, this.totalSlots() - this.carTotal()) || 20
  );

  public readonly motoOccupied = computed<number>(() =>
    Math.min(
      this.motoTotal(),
      Math.max(0, this.occupiedSlots() - this.carOccupied())
    )
  );

  public readonly motoRate = computed<number>(() =>
    this.motoTotal() > 0
      ? Math.round((this.motoOccupied() / this.motoTotal()) * 100)
      : 70
  );

  public readonly estimatedTurno = computed<number>(() =>
    this.occupiedSlots() > 0 ? this.occupiedSlots() * 14250 : 642500
  );
}
