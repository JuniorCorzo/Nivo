import { Injectable, signal, computed, inject } from "@angular/core";
import type { SlotStatus, SlotSummary } from "@core/models/slot.model";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export const VALID_STATUS_TRANSITIONS = {
  AVAILABLE: ["OCCUPIED", "MAINTENANCE", "RESERVED"],
  MAINTENANCE: ["AVAILABLE"],
  OCCUPIED: ["AVAILABLE", "MAINTENANCE"],
  RESERVED: ["AVAILABLE", "OCCUPIED"],
} satisfies Record<SlotStatus, SlotStatus[]>;

export interface StatusModalCopy {
  body: string;
  requiresExtraConfirm: boolean;
  title: string;
}

export const getStatusTransitionOptions = (currentStatus: SlotStatus): SlotStatus[] =>
  VALID_STATUS_TRANSITIONS[currentStatus] ?? [];

export const getStatusModalCopy = (
  currentStatus: SlotStatus,
  nextStatus: SlotStatus,
  hasTicket: boolean,
): StatusModalCopy => {
  const { title, warningActiveTicket, confirmChange } = APP_TEXTS.slots.statusModal;
  if (currentStatus === "OCCUPIED" && nextStatus === "AVAILABLE" && hasTicket) {
    return {
      body: warningActiveTicket,
      requiresExtraConfirm: true,
      title,
    };
  }
  return {
    body: confirmChange(currentStatus, nextStatus),
    requiresExtraConfirm: false,
    title,
  };
};

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
    if (!slot) {
      return [];
    }
    return getStatusTransitionOptions(slot.status);
  });

  readonly statusModalCopy = computed(() => {
    const slot = this.statusTarget();
    const next = this.statusNext();
    if (!slot || !next) {
      return {
        body: "",
        requiresExtraConfirm: false,
        title: APP_TEXTS.slots.statusModal.title,
      };
    }
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
    if (!slot || !next) {
      return;
    }

    this.slotsService
      .update({
        id: slot.id,
        parkingLotId: parkingId,
        slotNumber: slot.slotNumber,
        status: next,
        type: slot.type,
      })
      .subscribe({
        error: () => {
          this.toast.showToast({
            message: APP_TEXTS.slots.statusModal.error,
            type: "error",
          });
        },
        next: () => {
          this.toast.showToast({
            message: APP_TEXTS.slots.statusModal.success,
            type: "success",
          });
          this.closeStatusModal();
        },
      });
  }
}
