import { HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import type {
  CreateSpecialPolicies,
  RatesDto,
  SpecialPoliciesDto,
} from "@core/api/generated/models";
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
import type { CreateSpecialPolicyModel } from "@core/models/parking-policy.model";
import type {
  CreateRateModel,
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
  createSpecialPolicy(
    model: CreateSpecialPolicyModel
  ): Observable<SpecialPolicyModel> {
    const body: CreateSpecialPolicies = {
      modifies: model.modifies,
      name: model.name,
      operation: model.operation,
      valueToModify: model.valueToModify,
    };

    return this.tenantsService
      .createAtSpecialPolicies({ body }, RateService.httpContext())
      .pipe(
        map((response) => {
          const data = response.data as SpecialPoliciesDto;
          const policy = mapToSpecialPolicyModel(data);
          if (!policy) {
            throw new Error("Error mapping created special policy");
          }
          return policy;
        }),
        tap((createdPolicy) => {
          this.specialPoliciesState.update((policies) => [
            ...policies,
            createdPolicy,
          ]);
        })
      );
  }
}
