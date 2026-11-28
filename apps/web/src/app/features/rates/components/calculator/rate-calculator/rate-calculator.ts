import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type {
  RateModel,
  SimulateRateParams,
  SimulateRateResult,
  SpecialPolicyModel,
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

const MAX_SIMULATION_MINUTES = 525_600;
const DEFAULT_GRACE_PERIOD_MINUTES = 15;
const DEFAULT_TIME_UNIT: TimeUnit = "HOURS";
const DEFAULT_PRICE_BY_VEHICLE = {
  BIKE: 4000,
  CAR: 4000,
  MOTORCYCLE: 2000,
} as const satisfies Record<VehicleType, number>;

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

        @if (parking(); as activeParking) {
          <div
            class="bg-muted/40 border-border flex flex-col gap-2 rounded-xl border p-3 text-xs"
            data-testid="parking-rate-context"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-foreground font-semibold">
                {{ texts.configuredContextTitle }}: {{ activeParking.name }}
              </span>
              @if (ivaRate() !== null) {
                <span class="text-muted-foreground font-medium">
                  {{ texts.ivaLabel }}: {{ ivaPercent() }}%
                </span>
              }
            </div>

            @if (matchedRate(); as configuredRate) {
              <div class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  {{ texts.minChargeLabel }}:
                  <strong class="text-foreground"
                    >{{ configuredRate.minChargeTimeMinutes }} min</strong
                  >
                </span>
                @if (
                  (gracePeriodPrice() ?? 0) > 0 && gracePeriodMinutes() > 0
                ) {
                  <span>
                    {{ texts.gracePeriodPriceLabel }}:
                    <strong class="text-foreground">{{
                      gracePeriodPrice()
                        | currency: "COP" : "symbol-narrow" : "1.0-0"
                    }}</strong>
                  </span>
                }
                @if (configuredRate.specialPolicy; as policy) {
                  @if (policy.active) {
                    <span>
                      {{ texts.specialPolicyLabel }}:
                      <strong class="text-foreground">{{ policy.name }}</strong>
                    </span>
                  }
                }
              </div>
            } @else {
              <p class="font-medium text-amber-600 dark:text-amber-400">
                {{ texts.noConfiguredRateWarning }}
              </p>
            }
          </div>
        }

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
            [attr.max]="maxMinutesStayed"
            [hint]="texts.minutesStayedMaxHint"
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

  readonly parkingId = input<string | null>(null);
  readonly parking = input<ParkingLotListItemModel | null>(null);
  readonly rates = input<RateModel[]>([]);

  protected readonly texts = APP_TEXTS.rates.calculator;
  protected readonly maxMinutesStayed = MAX_SIMULATION_MINUTES;
  readonly vehicleTypeOptions = VEHICLE_TYPE_OPTIONS;
  readonly timeUnitOptions = TIME_UNIT_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly vehicleType = signal<VehicleType>("CAR");
  readonly timeUnit = signal<TimeUnit>(DEFAULT_TIME_UNIT);
  readonly pricePerUnit = signal<number | undefined>(
    DEFAULT_PRICE_BY_VEHICLE.CAR
  );
  readonly minutesStayed = signal<number>(90);
  readonly gracePeriodMinutes = signal<number>(DEFAULT_GRACE_PERIOD_MINUTES);
  readonly gracePeriodPrice = signal<number | null>(null);
  readonly minChargeTimeMinutes = signal<number | null>(null);
  readonly ivaRate = signal<number | null>(null);
  readonly specialPolicy = signal<SpecialPolicyModel | null>(null);
  readonly rateName = signal<string | null>(null);

  readonly matchedRate = computed(
    () => this.rates().find((r) => r.vehicleType === this.vehicleType()) ?? null
  );
  readonly ivaPercent = computed(() => Math.round((this.ivaRate() ?? 0) * 100));

  readonly simulation = signal<SimulateRateResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly simulationParams = computed<SimulateRateParams>(() => {
    const params: SimulateRateParams = {
      gracePeriodMinutes: this.gracePeriodMinutes(),
      minutesStayed: this.minutesStayed(),
      pricePerUnit: this.pricePerUnit(),
      timeUnit: this.timeUnit(),
      vehicleType: this.vehicleType(),
    };

    const gracePrice = this.gracePeriodPrice();
    if (gracePrice !== null && this.gracePeriodMinutes() > 0) {
      params.gracePeriodPrice = gracePrice;
    }

    const iva = this.ivaRate();
    if (iva !== null) {
      params.ivaRate = iva;
    }

    const minCharge = this.minChargeTimeMinutes();
    if (minCharge !== null) {
      params.minChargeTimeMinutes = minCharge;
    }

    const name = this.rateName();
    if (name !== null) {
      params.rateName = name;
    }

    const policy = this.specialPolicy();
    if (policy) {
      params.specialPolicy = {
        active: policy.active,
        modifies: policy.modifies,
        name: policy.name,
        operation: policy.operation,
        valueToModify: policy.valueToModify,
      };
    }

    return params;
  });

  constructor() {
    effect(() => {
      const activeParking = this.parking();
      const configuredRates = this.rates();

      untracked(() => {
        this.applyParkingPolicy(activeParking);

        if (configuredRates.length > 0) {
          const currentVehicle = this.vehicleType();
          const targetRate =
            configuredRates.find((r) => r.vehicleType === currentVehicle) ??
            configuredRates[0];
          this.vehicleType.set(targetRate.vehicleType);
          this.applyConfiguredRate(targetRate);
        } else {
          this.clearConfiguredRate();
        }
      });
    });

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
    if (!matched) {
      return;
    }

    /* SAFETY: Select options are restricted to valid VehicleType values */
    const nextVehicleType = matched.value as VehicleType;
    this.vehicleType.set(nextVehicleType);

    const configuredRates = this.rates();
    if (this.parking() !== null || configuredRates.length > 0) {
      const rateForVehicle = configuredRates.find(
        (r) => r.vehicleType === nextVehicleType
      );
      if (rateForVehicle) {
        this.applyConfiguredRate(rateForVehicle);
      } else {
        this.applyParkingPolicy(this.parking());
        this.clearConfiguredRate();
      }
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
      Number.isFinite(parsed) && parsed >= 0
        ? Math.min(MAX_SIMULATION_MINUTES, Math.trunc(parsed))
        : 0
    );
  }

  onGracePeriodInput(event: Event): void {
    const parsed = Number(readInputValue(event));
    this.gracePeriodMinutes.set(
      Number.isFinite(parsed) && parsed >= 0
        ? Math.min(MAX_SIMULATION_MINUTES, Math.trunc(parsed))
        : 0
    );
  }

  private applyParkingPolicy(
    activeParking: ParkingLotListItemModel | null
  ): void {
    if (activeParking) {
      this.gracePeriodMinutes.set(
        activeParking.gracePeriodMinutes ?? DEFAULT_GRACE_PERIOD_MINUTES
      );
      this.gracePeriodPrice.set(activeParking.gracePeriodPrice ?? 0);
      this.ivaRate.set(activeParking.ivaRate ?? null);
    } else {
      this.gracePeriodMinutes.set(DEFAULT_GRACE_PERIOD_MINUTES);
      this.gracePeriodPrice.set(null);
      this.ivaRate.set(null);
    }
  }

  private applyConfiguredRate(rate: RateModel): void {
    const activeParking = this.parking();
    if (activeParking) {
      this.applyParkingPolicy(activeParking);
    }
    this.timeUnit.set(rate.timeUnit);
    this.pricePerUnit.set(rate.pricePerUnit);
    this.minChargeTimeMinutes.set(rate.minChargeTimeMinutes);
    this.specialPolicy.set(rate.specialPolicy ?? null);
    this.rateName.set(rate.name);
  }

  private clearConfiguredRate(): void {
    this.timeUnit.set(DEFAULT_TIME_UNIT);
    this.pricePerUnit.set(DEFAULT_PRICE_BY_VEHICLE[this.vehicleType()]);
    this.minChargeTimeMinutes.set(null);
    this.specialPolicy.set(null);
    this.rateName.set(null);
  }
}
