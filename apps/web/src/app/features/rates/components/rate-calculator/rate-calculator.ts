import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InputComponent,
  SelectComponent,
} from '@nivo-sass/design-system';
import { RateService } from '@core/services/rate-service';
import { RatePreviewComponent } from './rate-preview';
import { TimeUnit, VehicleType } from '@core/models/rate.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalculator } from '@ng-icons/lucide';
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
    InputComponent,
    SelectComponent,
    RatePreviewComponent,
    NgIcon,
  ],
  providers: [provideIcons({ lucideCalculator })],
  template: `
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
      <div class="rounded-2xl bg-card text-card-foreground border border-border p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div class="flex items-center gap-3 border-b border-border pb-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ng-icon name="lucideCalculator" class="text-base" />
          </div>
          <div>
            <h3 class="text-base font-bold text-foreground">Calculadora interactiva de tarifas</h3>
            <p class="text-xs text-muted-foreground">Ingresá los parámetros de estancia para simular el cobro</p>
          </div>
        </div>

        <div class="flex flex-col gap-4 mt-1">
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
