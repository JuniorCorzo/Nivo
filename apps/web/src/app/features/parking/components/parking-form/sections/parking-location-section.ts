import { Component, input, output } from '@angular/core';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { Coordinates } from '@core/type/coordinates.type';
import { ParkingMapComponent } from '../../parking-map/parking-map';
import { TypographyH3 } from '@nivo-sass/design-system';

type CoordinateSummary = {
  label: string;
  coordinates: string | undefined;
};

@Component({
  selector: 'app-parking-location-section',
  standalone: true,
  imports: [ParkingMapComponent, TypographyH3],
  template: `
    <nv-h3 class="text-base">Ubicación</nv-h3>
    <div class="location-wrapper" (click)="mapInteracted.emit()">
      <app-parking-map
        [initialPosition]="initialPosition()"
        [readonly]="false"
        (positionChange)="positionChange.emit($event)"
      ></app-parking-map>

      @if (showPlaceholder()) {
        <div class="location-placeholder">
          {{ placeholderText() }}
        </div>
      }

      <div class="grid grid-cols-2 text-muted-foreground text-xs">
        @if (hasCoordinates()) {
          @for (coordinate of coordinates(); track $index) {
            <span class="flex flex-col gap-1">
              <span>{{ coordinate.label }}</span>
              <span>{{ coordinate.coordinates }}</span>
            </span>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .location-wrapper {
      position: relative;
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
      border-radius: 0.375rem;
      background-color: color-mix(in srgb, var(--color-muted) 90%, transparent);
      backdrop-filter: blur(2px);
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }
  `,
})
export class ParkingLocationSectionComponent {
  readonly initialPosition = input<Coordinates | undefined>(undefined);
  readonly coordinates = input<CoordinateSummary[]>([]);
  readonly hasCoordinates = input<boolean>(false);
  readonly showPlaceholder = input<boolean>(true);
  readonly placeholderText = input<string>(APP_TEXTS.parking.actions.placeholderMap);

  readonly positionChange = output<Coordinates>();
  readonly mapInteracted = output<void>();
}
