import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { Coordinates } from '@core/type/coordinates.type';
import { ParkingMapComponent } from '../../parking-map/parking-map';
import { TypographyH3, TypographyMuted } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';

type CoordinateSummary = {
  label: string;
  coordinates: string | undefined;
};

@Component({
  selector: 'app-parking-location-section',
  standalone: true,
  imports: [ParkingMapComponent, TypographyH3, TypographyMuted, NgIcon],
  providers: [provideIcons({ lucideMapPin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info border border-info/20">
        <ng-icon name="lucideMapPin" class="text-base" />
      </div>
      <div>
        <nv-h3 class="text-base font-bold text-foreground">Ubicación en el mapa</nv-h3>
        <nv-muted class="text-xs text-muted-foreground">
          Haz clic o arrastra en el mapa para fijar las coordenadas GPS
        </nv-muted>
      </div>
    </div>

    <div class="relative flex flex-col gap-3" (click)="mapInteracted.emit()">
      <div class="rounded-xl border border-border overflow-hidden shadow-inner">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          @for (coordinate of coordinates(); track $index) {
            <div class="flex items-center justify-between p-2 rounded-lg bg-muted border border-border">
              <span class="text-muted-foreground">{{ coordinate.label }}:</span>
              <span class="font-bold text-foreground">{{ coordinate.coordinates }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
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
