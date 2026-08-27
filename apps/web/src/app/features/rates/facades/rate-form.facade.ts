import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@nivo-sass/design-system';

import { RateService } from '@core/services/rate-service';
import { ParkingService } from '@core/services/parking-service';
import { RateModel, SpecialPolicyModel, TimeUnit, VehicleType } from '@core/models/rate.model';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';

export type RateFormMode = 'create' | 'edit';

@Injectable()
export class RateFormFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode = signal<RateFormMode>('create');
  readonly parkingId = signal<string | null>(null);
  readonly rateId = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = {
    name: signal('Tarifa Estándar'),
    description: signal(''),
    vehicleType: signal<VehicleType>('CAR'),
    timeUnit: signal<TimeUnit>('HOURS'),
    pricePerUnit: signal(5000),
    minChargeTimeMinutes: signal(15),
    specialPolicyId: signal<string | null>(null),
  };

  readonly previewDurationMinutes = signal(120);

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) return null;
    return (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ?? null;
  });

  readonly currentRate = computed<RateModel | null>(() => {
    const pId = this.parkingId();
    const rId = this.rateId();
    if (!pId || !rId) return null;
    const rates = this.rateService.ratesByParking()[pId] ?? [];
    return rates.find((r) => r.id === rId) ?? null;
  });

  readonly specialPolicies = this.rateService.specialPolicies;

  readonly selectedSpecialPolicy = computed<SpecialPolicyModel | undefined>(() => {
    const spId = this.form.specialPolicyId();
    if (!spId) return undefined;
    return this.specialPolicies().find((p) => p.id === spId);
  });

  readonly simulation = computed(() => {
    return this.rateService.simulateCalculation({
      basePrice: this.form.pricePerUnit() || 0,
      timeUnit: this.form.timeUnit(),
      durationInMinutes: this.previewDurationMinutes() || 0,
      specialPolicy: this.selectedSpecialPolicy(),
    });
  });

  readonly isValid = computed(() => {
    return (
      this.form.name().trim().length > 0 &&
      this.form.description().trim().length > 0 &&
      Boolean(this.form.vehicleType()) &&
      Boolean(this.form.timeUnit()) &&
      this.form.pricePerUnit() > 0 &&
      this.form.minChargeTimeMinutes() >= 0
    );
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pId = params.get('parkingId');
      const rId = params.get('rateId');
      this.parkingId.set(pId);
      this.rateId.set(rId);
      this.mode.set(rId ? 'edit' : 'create');

      if (pId) {
        this.rateService.getRatesByParkingId(pId).subscribe();
        this.rateService.loadSpecialPolicies().subscribe();
      }
    });

    effect(() => {
      const rate = this.currentRate();
      if (rate) {
        this.form.name.set(rate.name);
        this.form.description.set(rate.description);
        this.form.vehicleType.set(rate.vehicleType);
        this.form.timeUnit.set(rate.timeUnit);
        this.form.pricePerUnit.set(rate.pricePerUnit);
        this.form.minChargeTimeMinutes.set(rate.minChargeTimeMinutes);
        this.form.specialPolicyId.set(rate.specialPolicy?.id ?? null);
      }
    });
  }

  submit(): void {
    const pId = this.parkingId();
    if (!pId || !this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    if (this.mode() === 'create') {
      this.rateService
        .createRate({
          parkingId: pId,
          name: this.form.name().trim(),
          description: this.form.description().trim(),
          vehicleType: this.form.vehicleType(),
          timeUnit: this.form.timeUnit(),
          pricePerUnit: this.form.pricePerUnit(),
          minChargeTimeMinutes: this.form.minChargeTimeMinutes(),
          specialPolicyId: this.form.specialPolicyId() ?? undefined,
        })
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.showToast({ message: 'Tarifa creada con éxito', type: 'success' });
            this.navigateBack();
          },
          error: () => {
            this.isSubmitting.set(false);
            this.toast.showToast({ message: 'Error al crear la tarifa', type: 'error' });
          },
        });
    } else {
      const rId = this.rateId();
      if (!rId) return;

      this.rateService
        .updateRate(
          {
            id: rId,
            name: this.form.name().trim(),
            description: this.form.description().trim(),
            vehicleType: this.form.vehicleType(),
            timeUnit: this.form.timeUnit(),
            pricePerUnit: this.form.pricePerUnit(),
            minChargeTimeMinutes: this.form.minChargeTimeMinutes(),
          },
          pId,
        )
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.toast.showToast({ message: 'Tarifa actualizada', type: 'success' });
            this.navigateBack();
          },
          error: () => {
            this.isSubmitting.set(false);
            this.toast.showToast({ message: 'Error al actualizar la tarifa', type: 'error' });
          },
        });
    }
  }

  navigateBack(): void {
    const pId = this.parkingId();
    if (pId) {
      this.router.navigate([`/app/parking-lots/${pId}/rates`]);
    }
  }
}
