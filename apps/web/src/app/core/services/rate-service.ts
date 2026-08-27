import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ParkingLotsService, RatesService, TenantsService } from '@core/api/generated/services';
import { RatesDto, SpecialPoliciesDto } from '@core/api/generated/models';
import { AUTHORIZED } from '@core/http/context/auth.token';
import {
  CreateRateModel,
  RateCalculationSimulation,
  RateModel,
  SpecialPolicyModel,
  UpdateRateModel,
} from '@core/models/rate.model';
import {
  mapToCreateRateDto,
  mapToRateModel,
  mapToSpecialPolicyModel,
  mapToUpdateRateDto,
} from '@core/mappers/rate.mapper';

@Injectable({
  providedIn: 'root',
})
export class RateService {
  private parkingLotsService = inject(ParkingLotsService);
  private ratesService = inject(RatesService);
  private tenantsService = inject(TenantsService);

  private readonly ratesState = signal<Record<string, RateModel[]>>({});
  readonly ratesByParking = this.ratesState.asReadonly();

  private readonly specialPoliciesState = signal<SpecialPolicyModel[]>([]);
  readonly specialPolicies = this.specialPoliciesState.asReadonly();

  private httpContext = () => {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  };

  getRatesByParkingId(parkingId: string): Observable<RateModel[]> {
    return this.parkingLotsService
      .showRatesByParkingId({ parkingId }, this.httpContext())
      .pipe(
        map((response) => ((response.data ?? []) as RatesDto[]).map((item: RatesDto) => mapToRateModel(item))),
        tap((rates) =>
          this.ratesState.update((state) => ({
            ...state,
            [parkingId]: rates,
          })),
        ),
        catchError((error) => throwError(() => error)),
      );
  }

  createRate(model: CreateRateModel): Observable<RateModel> {
    const dto = mapToCreateRateDto(model);
    return this.parkingLotsService
      .createRateForParking({ body: dto }, this.httpContext())
      .pipe(
        map((response) => mapToRateModel(response.data!)),
        tap((createdRate) => {
          this.ratesState.update((state) => {
            const current = state[model.parkingId] ?? [];
            return {
              ...state,
              [model.parkingId]: [...current, createdRate],
            };
          });
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  updateRate(model: UpdateRateModel, parkingId: string): Observable<RateModel> {
    const dto = mapToUpdateRateDto(model);
    return this.ratesService
      .updateRate({ body: dto }, this.httpContext())
      .pipe(
        map((response) => mapToRateModel(response.data!)),
        tap((updatedRate) => {
          this.ratesState.update((state) => {
            const current = state[parkingId] ?? [];
            return {
              ...state,
              [parkingId]: current.map((r) => (r.id === updatedRate.id ? updatedRate : r)),
            };
          });
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  deleteRate(rateId: string, parkingId: string): Observable<void> {
    return this.ratesService
      .deleteRate({ id: rateId }, this.httpContext())
      .pipe(
        map(() => void 0),
        tap(() => {
          this.ratesState.update((state) => {
            const current = state[parkingId] ?? [];
            return {
              ...state,
              [parkingId]: current.filter((r) => r.id !== rateId),
            };
          });
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  loadSpecialPolicies(): Observable<SpecialPolicyModel[]> {
    return this.tenantsService
      .showSpecialPoliciesByTenant(undefined, this.httpContext())
      .pipe(
        map((response) =>
          ((response.data ?? []) as SpecialPoliciesDto[])
            .map((item) => mapToSpecialPolicyModel(item))
            .filter((p): p is SpecialPolicyModel => !!p),
        ),
        tap((policies) => this.specialPoliciesState.set(policies)),
        catchError((error) => throwError(() => error)),
      );
  }

  simulateCalculation(params: {
    basePrice: number;
    timeUnit: 'MINUTES' | 'HOURS' | 'DAYS';
    durationInMinutes: number;
    specialPolicy?: SpecialPolicyModel;
  }): RateCalculationSimulation {
    const { basePrice, timeUnit, durationInMinutes, specialPolicy } = params;

    let units = 0;
    if (timeUnit === 'MINUTES') {
      units = Math.max(1, durationInMinutes);
    } else if (timeUnit === 'HOURS') {
      units = Math.max(1, Math.ceil(durationInMinutes / 60));
    } else if (timeUnit === 'DAYS') {
      units = Math.max(1, Math.ceil(durationInMinutes / (60 * 24)));
    }

    const subtotal = units * basePrice;
    let discountOrSurcharge = 0;

    if (specialPolicy) {
      if (specialPolicy.operation === 'PERCENTAGE') {
        const factor = specialPolicy.valueToModify / 100;
        if (specialPolicy.modifies === 'DISCOUNT') {
          discountOrSurcharge = -(subtotal * factor);
        } else {
          discountOrSurcharge = subtotal * factor;
        }
      } else if (specialPolicy.operation === 'SUBTRACT') {
        discountOrSurcharge = -specialPolicy.valueToModify;
      } else {
        discountOrSurcharge = specialPolicy.valueToModify;
      }
    }

    const total = Math.max(0, subtotal + discountOrSurcharge);

    return {
      basePrice,
      timeUnit,
      unitsCalculated: units,
      durationInMinutes,
      subtotal,
      discountOrSurcharge,
      total,
    };
  }
}
