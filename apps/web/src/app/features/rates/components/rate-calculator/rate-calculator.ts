import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import type { TimeUnit, VehicleType } from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCalculator } from "@ng-icons/lucide";
import { InputComponent, SelectComponent } from "@nivo-sass/design-system";

import {
  TIME_UNIT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../shared/rate-presentations";
import { RatePreviewComponent } from "./rate-preview";

@Component({
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent,
    RatePreviewComponent,
    NgIcon,
  ],
  providers: [provideIcons({ lucideCalculator })],
  selector: "app-rate-calculator",
  standalone: true,
  template: `
    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div
        class="bg-card text-card-foreground border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6"
      >
        <div class="border-border flex items-center gap-3 border-b pb-3">
          <div
            class="bg-primary/10 text-primary border-primary/20 flex h-9 w-9 items-center justify-center rounded-xl border"
          >
            <ng-icon name="lucideCalculator" class="text-base" />
          </div>
          <div>
            <h3 class="text-foreground text-base font-bold">
              Calculadora interactiva de tarifas
            </h3>
            <p class="text-muted-foreground text-xs">
              Ingresá los parámetros de estancia para simular el cobro
            </p>
          </div>
        </div>

        <div class="mt-1 flex flex-col gap-4">
          <nv-select
            class="w-full"
            label="Tipo de vehículo"
            [items]="vehicleTypeOptions"
            [displayFn]="displayOptionFn"
            [valueFn]="valueOptionFn"
            [value]="vehicleType()"
            (valueChange)="onVehicleTypeChange($event)"
          />

          <nv-select
            class="w-full"
            label="Unidad de tiempo"
            [items]="timeUnitOptions"
            [displayFn]="displayOptionFn"
            [valueFn]="valueOptionFn"
            [value]="timeUnit()"
            (valueChange)="onTimeUnitChange($event)"
          />

          <nv-input
            label="Precio base por unidad ($)"
            type="number"
            placeholder="0"
            [value]="'' + basePrice()"
            (input)="onBasePriceInput($event)"
          />

          <nv-input
            label="Duración estimada (minutos)"
            type="number"
            placeholder="0"
            [value]="'' + durationMinutes()"
            (input)="onDurationInput($event)"
          />
        </div>
      </div>

      <div class="lg:sticky lg:top-4">
        <app-rate-preview [simulation]="simulation()" />
      </div>
    </div>
  `,
})
export class RateCalculatorComponent {
  private readonly rateService = inject(RateService);

  readonly vehicleType = signal<VehicleType>("CAR");
  readonly timeUnit = signal<TimeUnit>("HOURS");
  readonly basePrice = signal(5000);
  readonly durationMinutes = signal(90);

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly simulation = computed(() =>
    RateService.simulateCalculation({
      basePrice: this.basePrice(),
      durationInMinutes: this.durationMinutes(),
      timeUnit: this.timeUnit(),
    })
  );

  onVehicleTypeChange(val: string | null | undefined): void {
    if (val) {
      /* SAFETY: Value matches VehicleType union */
      this.vehicleType.set(val as VehicleType);
    }
  }

  onTimeUnitChange(val: string | null | undefined): void {
    if (val) {
      /* SAFETY: Value matches TimeUnit union */
      this.timeUnit.set(val as TimeUnit);
    }
  }

  onBasePriceInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.basePrice.set(target.valueAsNumber || 0);
  }

  onDurationInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.durationMinutes.set(target.valueAsNumber || 0);
  }
}
