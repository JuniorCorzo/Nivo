import { Injectable, signal, computed, inject } from '@angular/core';
import { ToastService } from '@nivo-sass/design-system';
import { SlotStatus, SlotSummary } from '@core/models/slot.model';
import { SlotService } from '@core/services/slot-service';

export const VALID_STATUS_TRANSITIONS: Record<SlotStatus, SlotStatus[]> = {
  AVAILABLE: ['OCCUPIED', 'MAINTENANCE', 'RESERVED'],
  OCCUPIED: ['AVAILABLE', 'MAINTENANCE'],
  MAINTENANCE: ['AVAILABLE'],
  RESERVED: ['AVAILABLE', 'OCCUPIED'],
};

export function getStatusTransitionOptions(currentStatus: SlotStatus): SlotStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
}

export function getStatusModalCopy(
  currentStatus: SlotStatus,
  nextStatus: SlotStatus,
  hasTicket: boolean,
): { title: string; body: string; requiresExtraConfirm: boolean } {
  const title = 'Cambiar estado';
  if (currentStatus === 'OCCUPIED' && nextStatus === 'AVAILABLE' && hasTicket) {
    return {
      title,
      body: 'La plaza tiene un ticket activo. Cambiar a disponible liberará el ticket actual. Esta acción puede generar inconsistencias.',
      requiresExtraConfirm: true,
    };
  }
  return {
    title,
    body: `¿Confirmar cambio de estado de ${currentStatus} a ${nextStatus}?`,
    requiresExtraConfirm: false,
  };
}

@Injectable()
export class SlotStatusState {
  private readonly slotsService = inject(SlotService);
  private readonly toast = inject(ToastService);

  readonly statusModalOpen = signal(false);
  readonly statusTarget = signal<SlotSummary | null>(null);
  readonly statusNext = signal<SlotStatus | null>(null);
  readonly statusConfirmChecked = signal(false);

  readonly statusTransitionOptions = computed(() => {
    const slot = this.statusTarget();
    if (!slot) return [];
    return getStatusTransitionOptions(slot.status);
  });

  readonly statusModalCopy = computed(() => {
    const slot = this.statusTarget();
    const next = this.statusNext();
    if (!slot || !next) return { title: 'Cambiar estado', body: '', requiresExtraConfirm: false };
    return getStatusModalCopy(slot.status, next, slot.hasTicket ?? false);
  });

  openStatusModal(slot: SlotSummary): void {
    this.statusTarget.set(slot);
    this.statusNext.set(null);
    this.statusConfirmChecked.set(false);
    this.statusModalOpen.set(true);
  }

  closeStatusModal(): void {
    this.statusModalOpen.set(false);
    this.statusTarget.set(null);
    this.statusNext.set(null);
    this.statusConfirmChecked.set(false);
  }

  selectStatusNext(status: SlotStatus): void {
    this.statusNext.set(status);
    this.statusConfirmChecked.set(false);
  }

  confirmStatusChange(parkingId: string): void {
    const slot = this.statusTarget();
    const next = this.statusNext();
    if (!slot || !next) return;

    this.slotsService.update({
      id: slot.id,
      parkingLotId: parkingId,
      slotNumber: slot.slotNumber,
      status: next,
      type: slot.type,
    }).subscribe({
      next: () => {
        this.toast.showToast({ message: 'Estado actualizado', type: 'success' });
        this.closeStatusModal();
      },
      error: () => {
        this.toast.showToast({ message: 'Error al actualizar estado', type: 'error' });
      },
    });
  }
}
