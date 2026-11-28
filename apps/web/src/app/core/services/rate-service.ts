import { HttpContext } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
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
import { AuthService } from "@core/services/auth-service";
import { UserService } from "@core/services/user/user-service";
import type { Observable } from "rxjs";
import { of, Subject } from "rxjs";
import { map, takeUntil, tap } from "rxjs/operators";

interface ScopeSnapshot {
  key: string | null;
  generation: number;
}

@Injectable({
  providedIn: "root",
})
export class RateService {
  private parkingLotsService = inject(ParkingLotsService);
  private ratesService = inject(RatesService);
  private tenantsService = inject(TenantsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  private activeScopeKey: string | null = null;
  private scopeGeneration = 0;
  private readonly scopeChanged$ = new Subject<void>();

  private readonly ratesState = signal<Record<string, RateModel[]>>({});
  readonly ratesByParking = this.ratesState.asReadonly();

  private readonly specialPoliciesState = signal<SpecialPolicyModel[]>([]);
  readonly specialPolicies = this.specialPoliciesState.asReadonly();

  constructor() {
    effect(() => {
      this.syncScope(this.resolveScopeKey());
    });
  }

  private resolveScopeKey(): string | null {
    const token = this.authService.accessTokenSignal();
    if (!token) {
      return null;
    }
    const tenantId = this.userService.currentUser()?.tenant?.id;
    return tenantId ? `tenant:${tenantId}` : `session:${token}`;
  }

  private syncScope(scopeKey: string | null): void {
    if (this.activeScopeKey !== scopeKey) {
      if (scopeKey === null || this.activeScopeKey !== null) {
        this.clearCache();
      }
      this.activeScopeKey = scopeKey;
      this.scopeGeneration += 1;
      this.scopeChanged$.next();
    }
  }

  private captureScope(): ScopeSnapshot {
    this.syncScope(this.resolveScopeKey());
    return {
      generation: this.scopeGeneration,
      key: this.activeScopeKey,
    };
  }

  private isScopeCurrent(snapshot: ScopeSnapshot): boolean {
    this.syncScope(this.resolveScopeKey());
    return (
      snapshot.key !== null &&
      this.activeScopeKey === snapshot.key &&
      this.scopeGeneration === snapshot.generation
    );
  }

  clearCache(): void {
    this.ratesState.set({});
    this.specialPoliciesState.set([]);
  }

  private static httpContext() {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  getRatesByParkingId(
    parkingId: string,
    force = false
  ): Observable<RateModel[]> {
    const scope = this.captureScope();
    const existing = this.ratesState()[parkingId];
    if (!force && existing !== undefined) {
      return of(existing);
    }
    return this.parkingLotsService
      .showRatesByParkingId({ parkingId }, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map((response) => {
          /* SAFETY: Response data represents RatesDto array from API */
          const items = (response.data ?? []) as RatesDto[];
          return items.map((item: RatesDto) => mapToRateModel(item));
        }),
        tap((rates) => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
          this.ratesState.update((state) => ({
            ...state,
            [parkingId]: rates,
          }));
        })
      );
  }

  createRate(model: CreateRateModel): Observable<RateModel> {
    const scope = this.captureScope();
    const dto = mapToCreateRateDto(model);
    return this.parkingLotsService
      .createRateForParking({ body: dto }, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map((response) => {
          /* SAFETY: Created rate response data is defined */
          const data = response.data as RatesDto;
          return mapToRateModel(data);
        }),
        tap((createdRate) => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
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
    const scope = this.captureScope();
    const dto = mapToUpdateRateDto(model);
    return this.ratesService
      .updateRate({ body: dto }, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map((response) => {
          /* SAFETY: Updated rate response data is defined */
          const data = response.data as RatesDto;
          return mapToRateModel(data);
        }),
        tap((updatedRate) => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
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
    const scope = this.captureScope();
    return this.ratesService
      .deleteRate({ id: rateId }, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map(() => {
          // void return
        }),
        tap(() => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
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

  loadSpecialPolicies(force = false): Observable<SpecialPolicyModel[]> {
    const scope = this.captureScope();
    const existing = this.specialPoliciesState();
    if (!force && existing.length > 0) {
      return of(existing);
    }
    return this.tenantsService
      .showSpecialPoliciesByTenant(undefined, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map((response) => {
          /* SAFETY: Special policies response data is an array of SpecialPoliciesDto */
          const items = (response.data ?? []) as SpecialPoliciesDto[];
          return items
            .map((item) => mapToSpecialPolicyModel(item))
            .filter((p): p is SpecialPolicyModel => !!p);
        }),
        tap((policies) => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
          this.specialPoliciesState.set(policies);
        })
      );
  }
  createSpecialPolicy(
    model: CreateSpecialPolicyModel
  ): Observable<SpecialPolicyModel> {
    const scope = this.captureScope();
    const body: CreateSpecialPolicies = {
      modifies: model.modifies,
      name: model.name,
      operation: model.operation,
      valueToModify: model.valueToModify,
    };

    return this.tenantsService
      .createAtSpecialPolicies({ body }, RateService.httpContext())
      .pipe(
        takeUntil(this.scopeChanged$),
        map((response) => {
          /* SAFETY: Created special policy response data is defined */
          const data = response.data as SpecialPoliciesDto;
          const policy = mapToSpecialPolicyModel(data);
          if (!policy) {
            throw new Error("Error mapping created special policy");
          }
          return policy;
        }),
        tap((createdPolicy) => {
          if (!this.isScopeCurrent(scope)) {
            return;
          }
          this.specialPoliciesState.update((policies) => [
            ...policies,
            createdPolicy,
          ]);
        })
      );
  }
}
