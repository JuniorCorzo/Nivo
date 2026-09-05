import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { Coordinates } from "@core/type/coordinates.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCar,
  lucideCoins,
  lucideMapPin,
  lucideParkingSquare,
} from "@ng-icons/lucide";
import {
  CardComponent,
  TypographyMono,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { formatCoordinates } from "@shared/utils/coordinates.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, CardComponent, TypographyMuted, TypographyMono],
  providers: [
    provideIcons({
      lucideCar,
      lucideCoins,
      lucideMapPin,
      lucideParkingSquare,
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

  public readonly formattedCoords = computed<string>(() => {
    const coords = this.coordinates();
    if (!coords) {
      return "";
    }
    return formatCoordinates(coords);
  });
}
