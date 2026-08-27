import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardComponent,
  InputComponent,
  SelectComponent,
  TypographyH3,
  TypographyMuted,
} from '@nivo-sass/design-system';
import { RateService } from '@core/services/rate-service';
import { RatePreviewComponent } from './rate-preview';
import { TimeUnit, VehicleType } from '@core/models/rate.model';
import {
  TIME_UNIT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from '../../shared/rate-presentations';

@Component({
  selector: 'app-rate-calculator',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    InputComponent,
    SelectComponent,
    TypographyH3,
    TypographyMuted,
    RatePreviewComponent,
  ],
  template: `
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
      <nv-card class="p-4 sm:p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <nv-h3>Calculadora interactiva de tarifas</nv-h3>
          <nv-muted>Ingresá los parámetros de estancia para simular el cobro</nv-muted>
        </div>

        <div class="flex flex-col gap-4 mt-2">
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
      </nv-card>

      <div class="lg:sticky lg:top-4">
        <app-rate-preview [simulation]="simulation()" />
      </div>
    </div>
  `,
})
export class RateCalculatorComponent {
  private readonly rateService = inject(RateService);

  readonly vehicleType = signal<VehicleType>('CAR');
  readonly timeUnit = signal<TimeUnit>('HOURS');
  readonly basePrice = signal(5000);
  readonly durationMinutes = signal(90);

  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly simulation = computed(() =>
    this.rateService.simulateCalculation({
      basePrice: this.basePrice(),
      timeUnit: this.timeUnit(),
      durationInMinutes: this.durationMinutes(),
    }),
  );

  onVehicleTypeChange(val: any): void {
    if (val) this.vehicleType.set(val as VehicleType);
  }

  onTimeUnitChange(val: any): void {
    if (val) this.timeUnit.set(val as TimeUnit);
  }

  onBasePriceInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.basePrice.set(target.valueAsNumber || 0);
  }

  onDurationInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.durationMinutes.set(target.valueAsNumber || 0);
  }
}
