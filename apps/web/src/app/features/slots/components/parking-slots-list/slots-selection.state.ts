import { Injectable, signal, computed } from '@angular/core';
import { SlotSummary } from '@core/models/slot.model';

@Injectable()
export class SlotsSelectionState {
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedCount = computed(() => this.selectedIds().size);

  allSelected(filteredSlots: SlotSummary[]): boolean {
    return filteredSlots.length > 0 && filteredSlots.every((slot) => this.selectedIds().has(slot.id));
  }

  toggleSelected(slotId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (checked) next.add(slotId);
      else next.delete(slotId);
      return next;
    });
  }

  toggleAll(event: Event, filteredSlots: SlotSummary[]): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(
      checked ? new Set(filteredSlots.map((slot) => slot.id)) : new Set(),
    );
  }

  clear(): void {
    this.selectedIds.set(new Set());
  }

  remove(id: string): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }
}
