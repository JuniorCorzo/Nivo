import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@nivo-sass/design-system';

import { ParkingService } from '@core/services/parking-service';
import { SlotService } from '@core/services/slot-service';
import { ParkingSlotStatus } from '@core/type/parking-slot.type';
import { SlotType } from '@core/type/slot-distribution.type';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';

export type ParkingSlotFormMode = 'create' | 'edit';

@Injectable()
export class ParkingSlotFormFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly slotsService = inject(SlotService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode = signal<ParkingSlotFormMode>('create');
  readonly parkingId = signal<string | null>(null);
  readonly slotId = signal<string | null>(null);

  readonly form = {
    prefix: signal('A'),
    from: signal(1),
    to: signal(10),
    zone: signal(''),
    type: signal<SlotType>('CAR'),
    status: signal<ParkingSlotStatus>('AVAILABLE'),
    number: signal('A-001'),
  };

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) return null;
    return (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ?? null;
  });

  readonly currentSlot = computed(() => {
    const parkingId = this.parkingId();
    const slotId = this.slotId();
    if (!parkingId || !slotId) return null;
    const list = this.slotsService.summaries()[parkingId] ?? [];
    return list.find((s) => s.id === slotId) ?? null;
  });

  readonly title = computed(() =>
    this.mode() === 'create'
      ? APP_TEXTS.parking.slots.create.title
      : APP_TEXTS.parking.slots.edit.title,
  );

  readonly description = computed(() =>
    this.mode() === 'create'
      ? APP_TEXTS.parking.slots.create.subtitle
      : APP_TEXTS.parking.slots.edit.subtitle,
  );

  readonly previewCount = computed(() => Math.max(0, this.form.to() - this.form.from() + 1));

  readonly previewRange = computed(() => {
    const prefix = this.form.prefix().trim() || 'A';
    const items: string[] = [];
    const from = this.form.from();
    const to = this.form.to();
    const count = this.previewCount();

    for (let index = from; index <= Math.min(to, from + 11); index += 1) {
      items.push(`${prefix}-${String(index).padStart(3, '0')}`);
    }
    return items.length > 0 ? `${items.join(', ')}${count > 12 ? '…' : ''}` : '—';
  });

  readonly conflictMessage = computed(() => {
    if (this.mode() !== 'create' || !this.parkingId()) return '';
    const parkingId = this.parkingId()!;
    const existing = this.slotsService.summaries()[parkingId] ?? [];
    const prefix = this.form.prefix().trim() || 'A';
    const range = new Set(
      Array.from(
        { length: this.previewCount() },
        (_, index) => `${prefix}-${String(this.form.from() + index).padStart(3, '0')}`,
      ),
    );
    return existing.some((slot) => range.has(slot.slotNumber))
      ? 'Hay plazas existentes en el rango propuesto. Ajustá el prefijo o el rango.'
      : '';
  });

  readonly editWarning = computed(() => {
    const slot = this.currentSlot();
    if (!slot) return '';
    if (slot.status === 'OCCUPIED') return 'La plaza está ocupada: el número queda bloqueado.';
    if (slot.hasTicket) return 'La plaza tiene ticket activo: el tipo queda bloqueado.';
    return '';
  });

  readonly isNumberLocked = computed(() => this.currentSlot()?.status === 'OCCUPIED');
  readonly isTypeLocked = computed(() => Boolean(this.currentSlot()?.hasTicket));
  readonly isBlocked = computed(
    () => this.mode() === 'create' && (this.previewCount() < 1 || !!this.conflictMessage()),
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.parkingId.set(params.get('parkingId'));
      this.slotId.set(params.get('slotId'));
      this.mode.set(this.slotId() ? 'edit' : 'create');

      const parkingId = this.parkingId();
      if (parkingId) {
        this.slotsService.getAllSlotSummariesByParkingId(parkingId).subscribe();
      }
    });

    effect(() => {
      const slot = this.currentSlot();
      if (slot) {
        this.form.number.set(slot.slotNumber);
        this.form.prefix.set(slot.prefix);
        this.form.zone.set(slot.zone);
        this.form.type.set(slot.type);
        this.form.status.set(slot.status);
      }
    });
  }

  submit(): void {
    const parkingId = this.parkingId();
    if (!parkingId) return;

    if (this.mode() === 'create') {
      this.slotsService
        .createBatch({
          parkingLotId: parkingId,
          slots: [
            {
              prefix: this.form.prefix().trim() || 'A',
              zone: this.form.zone().trim(),
              slotType: this.form.type(),
              numberSlots: this.previewCount(),
            },
          ],
        })
        .subscribe({
          next: () => {
            this.toast.showToast({ message: 'Plazas creadas', type: 'success' });
            this.router.navigate([APP_ROUTES.app.parkingLotSlots(parkingId)]);
          },
        });
    } else {
      const slot = this.currentSlot();
      if (!slot) return;
      this.slotsService
        .update({
          id: slot.id,
          parkingLotId: parkingId,
          slotNumber: this.form.number(),
          status: this.form.status(),
          type: this.form.type(),
        })
        .subscribe({
          next: () => {
            this.toast.showToast({ message: 'Cambios guardados', type: 'success' });
            this.router.navigate([APP_ROUTES.app.parkingLotSlots(parkingId)]);
          },
        });
    }
  }
}
