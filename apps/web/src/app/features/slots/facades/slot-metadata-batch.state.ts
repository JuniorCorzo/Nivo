import { Injectable, inject, signal } from "@angular/core";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";

export interface UpdateSlotsMetadataPayload {
  hasCharger?: boolean;
  isAccessible?: boolean;
  isActive?: boolean;
  slotIds: string[];
}

@Injectable()
export class SlotMetadataBatchState {
  private readonly slotsService = inject(SlotService);
  private readonly toast = inject(ToastService, { optional: true });

  readonly metadataModalOpen = signal(false);

  openMetadataModal(selectedCount: number): void {
    if (selectedCount === 0) {
      return;
    }
    this.metadataModalOpen.set(true);
  }

  closeMetadataModal(): void {
    this.metadataModalOpen.set(false);
  }

  updateSlotsMetadata(
    payload: UpdateSlotsMetadataPayload,
    parkingId: string | null,
    onDone?: () => void
  ): void {
    if (!parkingId) {
      return;
    }

    this.slotsService.updateSlotMetadata(payload).subscribe({
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          "Error al actualizar equipamiento";
        this.toast?.showToast({
          message: msg,
          type: "error",
        });
      },
      next: () => {
        this.closeMetadataModal();
        onDone?.();
        this.toast?.showToast({
          message: "Equipamiento actualizado",
          type: "success",
        });
      },
    });
  }
}
