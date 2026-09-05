import { HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import type { RatesDto, SpecialPoliciesDto } from "@core/api/generated/models";
import {
  ParkingLotsService,
  RatesService,
  TenantsService,
} from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import {
  mapToCreateRateDto,
  mapToRateModel,
  mapToSpecialPolicyModel,
  mapToUpdateRateDto,
} from "@core/mappers/rate.mapper";
import type {
  CreateRateModel,
  RateCalculationSimulation,
  RateModel,
  SpecialPolicyModel,
  UpdateRateModel,
} from "@core/models/rate.model";
import type { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class RateService {
  private parkingLotsService = inject(ParkingLotsService);
  private ratesService = inject(RatesService);
  private tenantsService = inject(TenantsService);

  private readonly ratesState = signal<Record<string, RateModel[]>>({});
  readonly ratesByParking = this.ratesState.asReadonly();

  private readonly specialPoliciesState = signal<SpecialPolicyModel[]>([]);
  readonly specialPolicies = this.specialPoliciesState.asReadonly();

  private static httpContext() {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  getRatesByParkingId(parkingId: string): Observable<RateModel[]> {
    return this.parkingLotsService
      .showRatesByParkingId({ parkingId }, RateService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Response data represents RatesDto array from API */
          const items = (response.data ?? []) as RatesDto[];
          return items.map((item: RatesDto) => mapToRateModel(item));
        }),
        tap((rates) =>
          this.ratesState.update((state) => ({
            ...state,
            [parkingId]: rates,
          }))
        )
      );
  }

  createRate(model: CreateRateModel): Observable<RateModel> {
    const dto = mapToCreateRateDto(model);
    return this.parkingLotsService
      .createRateForParking({ body: dto }, RateService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Created rate response data is defined */
          const data = response.data as RatesDto;
          return mapToRateModel(data);
        }),
        tap((createdRate) => {
          this.ratesState.update((state) => {
            const current = state[model.parkingId] ?? [];
            return {
              ...state,
              [model.parkingId]: [...current, createdRate],
            };
          });
        })
      );
  }

  updateRate(model: UpdateRateModel, parkingId: string): Observable<RateModel> {
    const dto = mapToUpdateRateDto(model);
    return this.ratesService
      .updateRate({ body: dto }, RateService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Updated rate response data is defined */
          const data = response.data as RatesDto;
          return mapToRateModel(data);
        }),
        tap((updatedRate) => {
          this.ratesState.update((state) => {
            const current = state[parkingId] ?? [];
            return {
              ...state,
              [parkingId]: current.map((r) =>
                r.id === updatedRate.id ? updatedRate : r
              ),
            };
          });
        })
      );
  }

  deleteRate(rateId: string, parkingId: string): Observable<void> {
    return this.ratesService
      .deleteRate({ id: rateId }, RateService.httpContext())
      .pipe(
        map(() => {
          // void return
        }),
        tap(() => {
          this.ratesState.update((state) => {
            const current = state[parkingId] ?? [];
            return {
              ...state,
              [parkingId]: current.filter((r) => r.id !== rateId),
            };
          });
        })
      );
  }

  loadSpecialPolicies(): Observable<SpecialPolicyModel[]> {
    return this.tenantsService
      .showSpecialPoliciesByTenant(undefined, RateService.httpContext())
      .pipe(
        map((response) => {
          /* SAFETY: Special policies response data is an array of SpecialPoliciesDto */
          const items = (response.data ?? []) as SpecialPoliciesDto[];
          return items
            .map((item) => mapToSpecialPolicyModel(item))
            .filter((p): p is SpecialPolicyModel => !!p);
        }),
        tap((policies) => this.specialPoliciesState.set(policies))
      );
  }

  static simulateCalculation(params: {
    basePrice: number;
    durationInMinutes: number;
    specialPolicy?: SpecialPolicyModel;
    timeUnit: "DAYS" | "HOURS" | "MINUTES";
  }): RateCalculationSimulation {
    const { basePrice, durationInMinutes, specialPolicy, timeUnit } = params;

    let units = 0;
    if (timeUnit === "MINUTES") {
      units = Math.max(1, durationInMinutes);
    } else if (timeUnit === "HOURS") {
      units = Math.max(1, Math.ceil(durationInMinutes / 60));
    } else if (timeUnit === "DAYS") {
      units = Math.max(1, Math.ceil(durationInMinutes / (60 * 24)));
    }

    const subtotal = units * basePrice;
    let discountOrSurcharge = 0;

    if (specialPolicy) {
      if (specialPolicy.operation === "PERCENTAGE") {
        const factor = specialPolicy.valueToModify / 100;
        discountOrSurcharge =
          specialPolicy.modifies === "DISCOUNT"
            ? -(subtotal * factor)
            : subtotal * factor;
      } else if (specialPolicy.operation === "SUBTRACT") {
        discountOrSurcharge = -specialPolicy.valueToModify;
      } else {
        discountOrSurcharge = specialPolicy.valueToModify;
      }
    }

    const total = Math.max(0, subtotal + discountOrSurcharge);

    return {
      basePrice,
      discountOrSurcharge,
      durationInMinutes,
      subtotal,
      timeUnit,
      total,
      unitsCalculated: units,
    };
  }
}
