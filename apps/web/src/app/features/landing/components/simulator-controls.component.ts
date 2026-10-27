import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { VehicleType } from "@core/type/vehicle-type.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBike, lucideCar, lucideMotorbike } from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgIcon,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
  ],
  providers: [
    provideIcons({
      lucideBike,
      lucideCar,
      lucideMotorbike,
    }),
  ],
  selector: "app-simulator-controls",
  standalone: true,
  template: `
    <nv-card class="border-border bg-card p-6 shadow-xs sm:p-8">
      <nv-card-header class="p-0 pb-6">
        <nv-card-title class="text-xl font-bold">
          {{ texts.configTitle }}
        </nv-card-title>
        <nv-card-description class="text-sm">
          {{ texts.configDescription }}
        </nv-card-description>
      </nv-card-header>

      <nv-card-content class="space-y-6 p-0">
        <!-- Vehicle Type Selector -->
        <div>
          <label
            class="mb-2 block text-sm font-medium text-[var(--foreground)]"
          >
            {{ texts.vehicleTypeLabel }}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <nv-button
              [variant]="vehicleType() === 'CAR' ? 'default' : 'outline'"
              (click)="vehicleTypeChange.emit('CAR')"
              class="flex min-h-[44px] w-full items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
            >
              <ng-icon name="lucideCar" size="18" />
              <span>{{ texts.vehicles.car }}</span>
            </nv-button>

            <nv-button
              [variant]="vehicleType() === 'MOTORCYCLE' ? 'default' : 'outline'"
              (click)="vehicleTypeChange.emit('MOTORCYCLE')"
              class="flex min-h-[44px] w-full items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
            >
              <ng-icon name="lucideMotorbike" size="18" />
              <span>{{ texts.vehicles.motorcycle }}</span>
            </nv-button>

            <nv-button
              [variant]="vehicleType() === 'BIKE' ? 'default' : 'outline'"
              (click)="vehicleTypeChange.emit('BIKE')"
              class="flex min-h-[44px] w-full items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
            >
              <ng-icon name="lucideBike" size="18" />
              <span>{{ texts.vehicles.bike }}</span>
            </nv-button>
          </div>
        </div>

        <!-- Duration Selection -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-medium text-[var(--foreground)]">
              {{ texts.stayDurationLabel }}
            </label>
            <span
              class="font-mono text-sm font-semibold text-[var(--foreground)]"
            >
              {{
                texts.minutesStayedText(
                  minutesStayed(),
                  (minutesStayed() / 60 | number: "1.1-1") ?? "0"
                )
              }}
            </span>
          </div>

          <!-- Presets -->
          <div class="mb-4 flex flex-wrap gap-2">
            @for (preset of texts.durationPresets; track preset.value) {
              <nv-button
                size="sm"
                [variant]="
                  minutesStayed() === preset.value ? 'default' : 'outline'
                "
                class="transition-all duration-150 active:scale-95"
                (click)="durationChange.emit(preset.value)"
              >
                {{ preset.label }}
              </nv-button>
            }
          </div>

          <!-- Manual Range / Input -->
          <div class="flex items-center gap-4">
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              [value]="minutesStayed()"
              (input)="onMinutesInputChange($event)"
              class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--muted)] accent-[var(--primary)]"
              [attr.aria-label]="texts.rangeAriaLabel"
              [attr.aria-valuemin]="15"
              [attr.aria-valuemax]="480"
              [attr.aria-valuenow]="minutesStayed()"
              [attr.aria-valuetext]="
                texts.minutesStayedText(
                  minutesStayed(),
                  (minutesStayed() / 60 | number: '1.1-1') ?? '0'
                )
              "
            />
          </div>
        </div>

        <!-- Rate Parameters Summary -->
        <div
          class="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-4 text-xs"
        >
          <div class="flex justify-between text-[var(--muted-foreground)]">
            <span>{{ texts.baseRateLabel }}</span>
            <span class="font-mono font-medium text-[var(--foreground)]">
              $ {{ pricePerUnit() | number: "1.0-0" }} {{ texts.copPerHour }}
            </span>
          </div>
          <div class="flex justify-between text-[var(--muted-foreground)]">
            <span>{{ texts.gracePeriodLabel }}</span>
            <span class="font-mono font-medium text-[var(--foreground)]">
              {{ gracePeriodMinutes() }} {{ texts.minutesUnit }}
            </span>
          </div>
          <div class="flex justify-between text-[var(--muted-foreground)]">
            <span>{{ texts.ivaRateLabel }}</span>
            <span class="font-mono font-medium text-[var(--foreground)]">
              {{ ivaRate() * 100 | number: "1.0-0" }}%
            </span>
          </div>
        </div>
      </nv-card-content>
    </nv-card>
  `,
})
export class SimulatorControlsComponent {
  protected readonly texts = APP_TEXTS.landing.simulator;

  readonly vehicleType = input.required<VehicleType>();
  readonly minutesStayed = input.required<number>();
  readonly pricePerUnit = input.required<number>();
  readonly gracePeriodMinutes = input.required<number>();
  readonly ivaRate = input.required<number>();

  readonly vehicleTypeChange = output<VehicleType>();
  readonly durationChange = output<number>();

  onMinutesInputChange(event: Event): void {
    /* SAFETY: event.target is an HTMLInputElement on range input change */
    const target = event.target as HTMLInputElement;
    if (Number.isFinite(target.valueAsNumber) && target.valueAsNumber > 0) {
      this.durationChange.emit(target.valueAsNumber);
    }
  }
}

export { SimulatorControlsComponent as LandingSimulatorControlsComponent };
