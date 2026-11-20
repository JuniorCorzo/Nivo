import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import type {
  SimulateRateParams,
  SimulateRateResult,
  TimeUnit,
  VehicleType,
} from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCalculator } from "@ng-icons/lucide";
import { InputComponent, SelectComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { EMPTY, catchError, debounceTime, switchMap, tap } from "rxjs";

import {
  TIME_UNIT_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../../../shared/rate-presentations";
import { RatePreviewComponent } from "./rate-preview";

const VALID_VEHICLE_TYPES = new Set<string>(["CAR", "MOTORCYCLE", "BIKE"]);
const VALID_TIME_UNITS = new Set<string>(["MINUTES", "HOURS", "DAYS"]);

const readInputValue = (event: Event): string =>
  event.target instanceof HTMLInputElement ? event.target.value : "";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
              {{ texts.title }}
            </h3>
            <p class="text-muted-foreground text-xs">
              {{ texts.subtitle }}
            </p>
          </div>
        </div>

        <div class="mt-1 flex flex-col gap-4">
          <nv-select
            class="w-full"
            [label]="texts.vehicleTypeLabel"
            [items]="vehicleTypeOptions"
            [displayFn]="displayOptionFn"
            [valueFn]="valueOptionFn"
            [value]="vehicleType()"
            (valueChange)="onVehicleTypeChange($event)"
          />

          <nv-select
            class="w-full"
            [label]="texts.timeUnitLabel"
            [items]="timeUnitOptions"
            [displayFn]="displayOptionFn"
            [valueFn]="valueOptionFn"
            [value]="timeUnit()"
            (valueChange)="onTimeUnitChange($event)"
          />

          <nv-input
            [label]="texts.pricePerUnitLabel"
            type="number"
            min="0"
            [placeholder]="texts.pricePerUnitPlaceholder"
            [value]="pricePerUnit() !== undefined ? '' + pricePerUnit() : ''"
            (input)="onPricePerUnitInput($event)"
          />

          <nv-input
            [label]="texts.minutesStayedLabel"
            type="number"
            min="0"
            [placeholder]="texts.minutesStayedPlaceholder"
            [value]="'' + minutesStayed()"
            (input)="onMinutesStayedInput($event)"
          />

          <nv-input
            [label]="texts.gracePeriodLabel"
            type="number"
            min="0"
            [placeholder]="texts.gracePeriodPlaceholder"
            [value]="'' + gracePeriodMinutes()"
            (input)="onGracePeriodInput($event)"
          />
        </div>
      </div>

      <div class="lg:sticky lg:top-4">
        <app-rate-preview
          [simulation]="simulation()"
          [isLoading]="isLoading()"
          [error]="error()"
          [minutesStayed]="minutesStayed()"
        />
      </div>
    </div>
  `,
})
export class RateCalculatorComponent {
  private readonly rateService = inject(RateService);

  protected readonly texts = APP_TEXTS.rates.calculator;
  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly vehicleType = signal<VehicleType>("CAR");
  readonly timeUnit = signal<TimeUnit>("HOURS");
  readonly pricePerUnit = signal<number | undefined>(4000);
  readonly minutesStayed = signal<number>(90);
  readonly gracePeriodMinutes = signal<number>(15);

  readonly simulation = signal<SimulateRateResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly simulationParams = computed<SimulateRateParams>(() => ({
    gracePeriodMinutes: this.gracePeriodMinutes(),
    minutesStayed: this.minutesStayed(),
    pricePerUnit: this.pricePerUnit(),
    timeUnit: this.timeUnit(),
    vehicleType: this.vehicleType(),
  }));

  constructor() {
    toObservable(this.simulationParams)
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.error.set(null);
        }),
        debounceTime(200),
        switchMap((params) =>
          this.rateService.simulateRate(params).pipe(
            catchError(() => {
              this.simulation.set(null);
              this.error.set(APP_TEXTS.rates.preview.errorFallback);
              this.isLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((result) => {
        this.simulation.set(result);
        this.error.set(null);
        this.isLoading.set(false);
      });
  }

  onVehicleTypeChange(value: unknown): void {
    const matched = VEHICLE_TYPE_OPTIONS.find(
      (opt) => opt.value === value && VALID_VEHICLE_TYPES.has(opt.value)
    );
    if (matched) {
      /* SAFETY: Select options are restricted to valid VehicleType values */
      this.vehicleType.set(matched.value as VehicleType);
    }
  }

  onTimeUnitChange(value: unknown): void {
    const matched = TIME_UNIT_OPTIONS.find(
      (opt) => opt.value === value && VALID_TIME_UNITS.has(opt.value)
    );
    if (matched) {
      /* SAFETY: Select options are restricted to valid TimeUnit values */
      this.timeUnit.set(matched.value as TimeUnit);
    }
  }

  onPricePerUnitInput(event: Event): void {
    const raw = readInputValue(event).trim();
    if (!raw) {
      this.pricePerUnit.set(undefined);
      return;
    }
    const parsed = Number(raw);
    this.pricePerUnit.set(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
  }

  onMinutesStayedInput(event: Event): void {
    const parsed = Number(readInputValue(event));
    this.minutesStayed.set(
      Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0
    );
  }

  onGracePeriodInput(event: Event): void {
    const parsed = Number(readInputValue(event));
    this.gracePeriodMinutes.set(
      Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0
    );
  }
}
