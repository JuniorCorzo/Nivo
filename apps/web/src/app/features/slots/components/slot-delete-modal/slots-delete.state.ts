import { Injectable, signal, computed, inject } from '@angular/core';
import { ToastService } from '@nivo-sass/design-system';
import { SlotSummary } from '@core/models/slot.model';
import { SlotService } from '@core/services/slot-service';

export function getDeleteModalCopy(slot: SlotSummary | null, scope: 'single' | 'batch'): string {
  if (!slot) return 'Seleccioná una plaza para eliminar.';
  if (scope === 'batch') return 'Hay plazas seleccionadas. Debés confirmar para continuar.';
  const base = `¿Eliminar la plaza ${slot.slotNumber}? Esta acción no se puede deshacer.`;
  if (slot.hasHistory) {
    return `${base} Esta plaza tiene historial de tickets. La eliminación afectará los registros asociados.`;
  }
  return base;
}

export function requiresDeleteConfirm(slot: SlotSummary | null): boolean {
  if (!slot) return false;
  return slot.hasHistory !== false;
}

@Injectable()
export class SlotDeleteState {
  private readonly slotsService = inject(SlotService);
  private readonly toast = inject(ToastService);

  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmChecked = signal(false);
  readonly deleteTarget = signal<SlotSummary | null>(null);
  readonly deleteScope = signal<'single' | 'batch'>('single');

  readonly deleteModalCopy = computed(() => getDeleteModalCopy(this.deleteTarget(), this.deleteScope()));
  readonly deleteRequiresConfirm = computed(() => requiresDeleteConfirm(this.deleteTarget()));

  openBatchDeleteModal(firstTarget: SlotSummary): void {
    this.deleteTarget.set(firstTarget);
    this.deleteConfirmChecked.set(false);
    this.deleteScope.set('batch');
    this.deleteModalOpen.set(true);
  }

  openDeleteModal(slot: SlotSummary): void {
    this.deleteTarget.set(slot);
    this.deleteConfirmChecked.set(false);
    this.deleteScope.set('single');
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteConfirmChecked.set(false);
    this.deleteTarget.set(null);
    this.deleteScope.set('single');
  }

  confirmDelete(
    parkingId: string,
    selectedIds: Set<string>,
    clearSelection: () => void,
    removeSingleSelection: (id: string) => void,
  ): void {
    const targetIds =
      this.deleteScope() === 'batch'
        ? [...selectedIds]
        : this.deleteTarget()?.id
          ? [this.deleteTarget()!.id]
          : [];

    if (targetIds.length === 0) return;

    if (this.deleteScope() === 'batch' || targetIds.length > 1) {
      this.slotsService.deleteBatch(targetIds, parkingId).subscribe({
        next: () => {
          clearSelection();
          this.toast.showToast({
            message: 'Plazas eliminadas',
            type: 'success',
          });
        },
      });
    } else {
      this.slotsService.delete(targetIds[0], parkingId).subscribe({
        next: () => {
          removeSingleSelection(targetIds[0]);
          this.toast.showToast({
            message: 'Plaza eliminada',
            type: 'success',
          });
        },
      });
    }

    this.closeDeleteModal();
  }
}
