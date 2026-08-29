import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ToastService } from '@nivo-sass/design-system';

import { ParkingService } from '@core/services/parking-service';
import { SlotService } from '@core/services/slot-service';
import { RateService } from '@core/services/rate-service';
import { TicketService } from '@core/services/ticket-service';
import { CreateTicketPayload, TicketSummary } from '@core/models/ticket.model';
import { SlotSummary, SlotType } from '@core/models/slot.model';
import { RateModel, VehicleType } from '@core/models/rate.model';

@Injectable()
export class CheckInFacade {
  private readonly ticketService = inject(TicketService);
  private readonly slotService = inject(SlotService);
  private readonly rateService = inject(RateService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly parkingId = signal<string | null>(null);
  readonly plate = signal<string>('');
  readonly email = signal<string>('');
  readonly vehicleType = signal<VehicleType>('CAR');
  readonly selectedSlotId = signal<string | null>(null);
  readonly selectedRateId = signal<string | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly lastIssuedTicket = signal<TicketSummary | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);

  readonly parking = computed(() => {
    const id = this.parkingId();
    if (!id) return null;
    return (this.parkingService.parkingLots() ?? []).find((lot) => lot.id === id) ?? null;
  });

  readonly allSlots = computed<SlotSummary[]>(() => {
    const id = this.parkingId();
    if (!id) return [];
    return this.slotService.summaries()[id] ?? [];
  });

  readonly availableSlots = computed<SlotSummary[]>(() => {
    const type = this.vehicleType();
    return this.allSlots().filter(
      (slot) => slot.status === 'AVAILABLE' && slot.type === type,
    );
  });

  readonly allRates = computed<RateModel[]>(() => {
    const id = this.parkingId();
    if (!id) return [];
    return this.rateService.ratesByParking()[id] ?? [];
  });

  readonly availableRates = computed<RateModel[]>(() => {
    const type = this.vehicleType();
    return this.allRates().filter((rate) => rate.vehicleType === type);
  });

  readonly hasAvailableSlots = computed<boolean>(() => {
    return this.availableSlots().length > 0;
  });

  readonly isValid = computed<boolean>(() => {
    const normalizedPlate = this.plate().trim();
    return (
      normalizedPlate.length >= 3 &&
      this.selectedSlotId() !== null &&
      this.selectedRateId() !== null &&
      !this.isSubmitting()
    );
  });

  init(parkingId: string): void {
    this.parkingId.set(parkingId);
    this.loadData(parkingId);
  }

  loadData(parkingId: string): void {
    this.slotService.getAllSlotSummariesByParkingId(parkingId).subscribe();
    this.rateService.getRatesByParkingId(parkingId).subscribe();
  }

  setPlate(plate: string): void {
    this.plate.set(plate.toUpperCase().trim());
    this.errorMessage.set(null);
  }

  setEmail(email: string): void {
    this.email.set(email.trim());
  }

  setVehicleType(type: VehicleType): void {
    this.vehicleType.set(type);

    // Auto-select first available slot for this vehicle type
    const slots = this.allSlots().filter(
      (s) => s.status === 'AVAILABLE' && s.type === type,
    );
    this.selectedSlotId.set(slots.length > 0 ? slots[0].id : null);

    // Auto-select first rate for this vehicle type
    const rates = this.allRates().filter((r) => r.vehicleType === type);
    this.selectedRateId.set(rates.length > 0 ? rates[0].id : null);
  }

  setSlotId(slotId: string | null): void {
    this.selectedSlotId.set(slotId);
  }

  setRateId(rateId: string | null): void {
    this.selectedRateId.set(rateId);
  }

  submitCheckIn(): void {
    const pId = this.parkingId();
    const slotId = this.selectedSlotId();
    const rateId = this.selectedRateId();
    const plate = this.plate().trim().toUpperCase();

    if (!pId || !slotId || !rateId || !plate) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateTicketPayload = {
      slotId,
      rateId,
      plate,
      email: this.email().trim() || undefined,
    };

    this.ticketService.createTicket(payload).subscribe({
      next: (ticket) => {
        this.isSubmitting.set(false);
        this.lastIssuedTicket.set(ticket);
        this.isReceiptOpen.set(true);
        this.toast.showToast({ message: 'Ingreso registrado con éxito', type: 'success' });

        // Refresh slots state
        this.slotService.getAllSlotSummariesByParkingId(pId).subscribe();

        // Reset plate & email for next rapid check-in
        this.plate.set('');
        this.email.set('');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          'Error al registrar el ingreso. Verifique la placa y disponibilidad de cupo.';
        this.errorMessage.set(errorMsg);
        this.toast.showToast({ message: errorMsg, type: 'error' });
      },
    });
  }

  closeReceipt(): void {
    this.isReceiptOpen.set(false);
  }

  reset(): void {
    this.plate.set('');
    this.email.set('');
    this.errorMessage.set(null);
    this.selectedSlotId.set(null);
    this.selectedRateId.set(null);
  }
}
