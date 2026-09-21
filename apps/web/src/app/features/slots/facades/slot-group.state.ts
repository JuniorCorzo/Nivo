import { Injectable, inject, signal } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";

import type { SlotGroupOption } from "../components/modals/slot-group-edit-modal/slot-group-edit-modal";

export interface UpdateSlotGroupPayload {
  currentPrefix: string;
  currentZone: string;
  newPrefix?: string;
  newZone?: string;
  parkingId: string;
}

export const availableGroups = (slots: SlotSummary[]): SlotGroupOption[] => {
  const map = new Map<string, SlotGroupOption>();
  for (const slot of slots) {
    const zone = slot.zone ?? "";
    const prefix = slot.prefix ?? "";
    const key = `${zone}:::${prefix}`;
    const isOccupied = slot.status !== "AVAILABLE";
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (isOccupied) {
        existing.occupiedCount += 1;
      }
    } else {
      map.set(key, {
        count: 1,
        occupiedCount: isOccupied ? 1 : 0,
        prefix,
        zone,
      });
    }
  }
  return [...map.values()].toSorted(
    (a, b) => a.zone.localeCompare(b.zone) || a.prefix.localeCompare(b.prefix),
  );
};

@Injectable()
export class SlotGroupState {
  private readonly slotsService = inject(SlotService);
  private readonly toast = inject(ToastService, { optional: true });

  readonly groupModalOpen = signal(false);
  readonly groupTarget = signal<{ zone: string; prefix: string } | null>(null);
  readonly availableGroups = availableGroups;

  openGroupModal(selectedSlots: SlotSummary[], zone?: string, prefix?: string): void {
    if (zone !== undefined && prefix !== undefined) {
      this.groupTarget.set({ prefix, zone });
    } else if (selectedSlots.length > 0) {
      this.groupTarget.set({
        prefix: selectedSlots[0].prefix,
        zone: selectedSlots[0].zone,
      });
    } else {
      this.groupTarget.set(null);
    }
    this.groupModalOpen.set(true);
  }

  closeGroupModal(): void {
    this.groupModalOpen.set(false);
    this.groupTarget.set(null);
  }

  updateSlotGroup(
    payload: UpdateSlotGroupPayload,
    slots: SlotSummary[],
    onDone?: () => void,
  ): void {
    const hasOccupied = slots.some(
      (slot) =>
        (slot.zone ?? "") === payload.currentZone &&
        (slot.prefix ?? "") === payload.currentPrefix &&
        slot.status !== "AVAILABLE",
    );
    if (hasOccupied) {
      this.toast?.showToast({
        message: "No se puede modificar el grupo porque contiene plazas ocupadas o no disponibles.",
        type: "error",
      });
      return;
    }

    this.slotsService.updateSlotGroup(payload).subscribe({
      error: (err) => {
        const msg = err?.error?.message || err?.message || "Error al actualizar el grupo de plazas";
        this.toast?.showToast({
          message: msg,
          type: "error",
        });
      },
      next: () => {
        this.closeGroupModal();
        onDone?.();
        this.toast?.showToast({
          message: "Grupo actualizado",
          type: "success",
        });
      },
    });
  }
}
