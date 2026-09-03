import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { Coordinates } from "@core/type/coordinates.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMapPin } from "@ng-icons/lucide";
import { TypographyH3, TypographyMuted } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { ParkingMapComponent } from "../../parking-map/parking-map";

export interface CoordinateSummary {
  label: string;
  coordinates: string | undefined;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParkingMapComponent, TypographyH3, TypographyMuted, NgIcon],
  providers: [provideIcons({ lucideMapPin })],
  selector: "app-parking-location-section",
  standalone: true,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .location-placeholder {
      position: absolute;
      inset: 0 auto auto 0;
      display: flex;
      width: 100%;
      height: 250px;
      border-radius: 0.75rem;
      background-color: color-mix(in srgb, var(--color-muted) 85%, transparent);
      backdrop-filter: blur(2px);
      justify-content: center;
      align-items: center;
      pointer-events: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `,
  template: `
    <div class="flex items-center gap-2">
      <div
        class="bg-info/10 text-info border-info/20 flex h-8 w-8 items-center justify-center rounded-lg border"
      >
        <ng-icon name="lucideMapPin" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-foreground text-base font-bold"
          >Ubicación en el mapa</nv-h3
        >
        <nv-muted class="text-muted-foreground text-xs">
          Haz clic o arrastra en el mapa para fijar las coordenadas GPS
        </nv-muted>
      </div>
    </div>

    <div class="relative flex flex-col gap-3" (click)="mapInteracted.emit()">
      <div class="border-border overflow-hidden rounded-xl border shadow-inner">
        <app-parking-map
          [initialPosition]="initialPosition()"
          [readonly]="false"
          (positionChange)="positionChange.emit($event)"
        />
      </div>

      @if (showPlaceholder()) {
        <div class="location-placeholder">
          {{ placeholderText() }}
        </div>
      }

      @if (hasCoordinates()) {
        <div class="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
          @for (coordinate of coordinates(); track $index) {
            <div
              class="bg-muted border-border flex items-center justify-between rounded-lg border p-2"
            >
              <span class="text-muted-foreground">{{ coordinate.label }}:</span>
              <span class="text-foreground font-bold">{{
                coordinate.coordinates
              }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ParkingLocationSectionComponent {
  readonly initialPosition = input<Coordinates | null | undefined>(null);
  readonly coordinates = input<CoordinateSummary[]>([]);
  readonly hasCoordinates = input<boolean>(false);
  readonly showPlaceholder = input<boolean>(true);
  readonly placeholderText = input<string>(
    APP_TEXTS.parking.actions.placeholderMap
  );

  readonly positionChange = output<Coordinates>();
  readonly mapInteracted = output();
}
