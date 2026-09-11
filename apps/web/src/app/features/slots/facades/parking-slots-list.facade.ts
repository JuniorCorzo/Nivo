import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import type { SlotStatus, SlotSummary } from "@core/models/slot.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { SlotDeleteState } from "../components/slot-delete-modal/slots-delete.state";
import { SlotStatusState } from "../components/slot-status-modal/slot-status.state";
import { SlotsSelectionState } from "../page/parking-slots-list/slots-selection.state";
import { SlotsTableState } from "../page/parking-slots-list/slots-table.state";
import type { SlotGroupOption } from "../components/slot-group-edit-modal/slot-group-edit-modal.component";
import {
  SLOT_STATUS_FILTER_OPTIONS,
  SLOT_TYPE_OPTIONS,
  SLOT_ZONE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../shared/parking-slot-presentations";

export {
  getDeleteModalCopy,
  requiresDeleteConfirm,
} from "../components/slot-delete-modal/slots-delete.state";
export {
  getStatusModalCopy,
  getStatusTransitionOptions,
  VALID_STATUS_TRANSITIONS,
} from "../components/slot-status-modal/slot-status.state";
export type { SlotGroupOption } from "../components/slot-group-edit-modal/slot-group-edit-modal.component";

export type DrawerTab = "general" | "history";

export interface HistoryCopy {
  empty: boolean;
  message?: string;
  title?: string;
}

export const getHistoryCopy = (slot: SlotSummary | null): HistoryCopy => {
  if (!slot) {
    return { empty: true };
  }
  if (!slot.hasHistory) {
    return { empty: true, message: "Sin historial de tickets" };
  }
  return {
    empty: false,
    message: "El detalle de tickets no está disponible en esta vista.",
    title: "Esta plaza tiene tickets previos.",
  };
};

@Injectable()
export class ParkingSlotsListFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly slotsService = inject(SlotService);

  private readonly selectionState = inject(SlotsSelectionState);
  private readonly tableState = inject(SlotsTableState);
  private readonly deleteState = inject(SlotDeleteState);
  private readonly statusState = inject(SlotStatusState);

  // ─── filter options ───
  readonly typeOptions = SLOT_TYPE_OPTIONS;
  readonly zoneOptions = SLOT_ZONE_FILTER_OPTIONS;
  readonly statusOptions = SLOT_STATUS_FILTER_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  // ─── delegated table & filter signals ───
  readonly globalFilter = this.tableState.globalFilter;
  readonly columnFilters = this.tableState.columnFilters;
  readonly pagination = this.tableState.pagination;

  // ─── delegated selection signals ───
  readonly selectedIds = this.selectionState.selectedIds;
  readonly selectedCount = this.selectionState.selectedCount;
  readonly allSelected = computed(() =>
    this.selectionState.allSelected(this.filteredSlots())
  );

  // ─── delegated delete signals ───
  readonly deleteModalOpen = this.deleteState.deleteModalOpen;
  readonly deleteConfirmChecked = this.deleteState.deleteConfirmChecked;
  readonly deleteTarget = this.deleteState.deleteTarget;
  readonly deleteScope = this.deleteState.deleteScope;
  readonly deleteModalCopy = this.deleteState.deleteModalCopy;
  readonly deleteRequiresConfirm = this.deleteState.deleteRequiresConfirm;

  // ─── delegated status signals ───
  readonly statusModalOpen = this.statusState.statusModalOpen;
  readonly statusTarget = this.statusState.statusTarget;
  readonly statusNext = this.statusState.statusNext;
  readonly statusConfirmChecked = this.statusState.statusConfirmChecked;
  readonly statusTransitionOptions = this.statusState.statusTransitionOptions;
  readonly statusModalCopy = this.statusState.statusModalCopy;

  private readonly toast = inject(ToastService, { optional: true });

  // ─── metadata batch signals ───
  readonly metadataModalOpen = signal(false);
  readonly selectedSlots = computed(() =>
    this.slots().filter((slot) => this.selectedIds().has(slot.id))
  );

  // ─── group edit signals ───
  readonly groupModalOpen = signal(false);
  readonly groupTarget = signal<{ zone: string; prefix: string } | null>(null);

  // ─── drawer & route specific signals ───
  readonly drawerSlotId = signal<string | null>(null);
  readonly drawerTab = signal<DrawerTab>("general");
  private readonly parkingId = signal<string | null>(null);

  readonly parking = computed(() => {
    const parkingId = this.parkingId();
    return parkingId
      ? (this.parkingService
          .parkingLots()
          .find((parking) => parking.id === parkingId) ?? null)
      : null;
  });

  readonly slots = computed(() => {
    const parkingId = this.parkingId();
    return parkingId ? (this.slotsService.summaries()[parkingId] ?? []) : [];
  });

  readonly availableGroups = computed<SlotGroupOption[]>(() => {
    const slots = this.slots();
    const map = new Map<string, SlotGroupOption>();
    for (const slot of slots) {
      const zone = slot.zone ?? "";
      const prefix = slot.prefix ?? "";
      const key = `${zone}:::${prefix}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { count: 1, prefix, zone });
      }
    }
    return [...map.values()].toSorted(
      (a, b) => a.zone.localeCompare(b.zone) || a.prefix.localeCompare(b.prefix)
    );
  });

  readonly table = this.tableState.initTable(() => this.slots());

  readonly filteredSlots = computed(() =>
    this.table.getRowModel().rows.map((row) => row.original)
  );

  readonly pageCount = computed(() => this.table.getPageCount());

  readonly drawerSlot = computed(() => {
    const id = this.drawerSlotId();
    return id ? (this.slots().find((slot) => slot.id === id) ?? null) : null;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.route.paramMap
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => {
        this.parkingId.set(params.get("parkingId"));
        this.drawerSlotId.set(params.get("slotId"));
      });

    effect((onCleanup) => {
      const parking = this.parking();
      if (!parking) {
        return;
      }

      const sub = this.slotsService
        .getAllSlotSummariesByParkingId(parking.id)
        .subscribe();

      onCleanup(() => sub.unsubscribe());
    });
  }

  // ─── navigation ───
  onCreate(): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.createParkingLotSlot(parking.id)]);
  }

  onEdit(slotId: string): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.router.navigate([
      APP_ROUTES.app.editParkingLotSlot(parking.id, slotId),
    ]);
  }

  openDrawer(slotId: string): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.drawerTab.set("general");
    this.router.navigate([
      APP_ROUTES.app.parkingLotSlotDetail(parking.id, slotId),
    ]);
  }

  closeDrawer(): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(parking.id)]);
  }

  setDrawerTab(tab: DrawerTab): void {
    this.drawerTab.set(tab);
  }

  // ─── filters ───
  onQueryInput(event: Event): void {
    /* SAFETY: event.target is guaranteed to be an HTMLInputElement for input event */
    this.tableState.globalFilter.set((event.target as HTMLInputElement).value);
  }

  columnFilterValue(key: string): string {
    return this.tableState.columnFilterValue(key);
  }

  setFilter(key: string, value: string): void {
    this.tableState.setFilter(key, value);
  }

  clearFilters(): void {
    this.tableState.clear();
    this.selectionState.clear();
  }

  // ─── pagination ───
  setPageIndex(index: number): void {
    this.tableState.pagination.update((p) => ({ ...p, pageIndex: index }));
  }

  // ─── selection ───
  toggleSelected(slotId: string, event: Event): void {
    this.selectionState.toggleSelected(slotId, event);
  }

  toggleAll(event: Event): void {
    this.selectionState.toggleAll(event, this.filteredSlots());
  }

  // ─── modals: status ───
  openStatusModal(slot: SlotSummary): void {
    this.statusState.openStatusModal(slot);
  }

  closeStatusModal(): void {
    this.statusState.closeStatusModal();
  }

  selectStatusNext(status: SlotStatus): void {
    this.statusState.selectStatusNext(status);
  }

  confirmStatusChange(): void {
    const parkingId = this.parkingId();
    if (!parkingId) {
      return;
    }
    this.statusState.confirmStatusChange(parkingId);
  }

  // ─── modals: delete ───
  openBatchDeleteModal(): void {
    const first = this.filteredSlots().find((slot) =>
      this.selectedIds().has(slot.id)
    );
    if (!first) {
      return;
    }
    this.deleteState.openBatchDeleteModal(first);
  }

  openDeleteModal(slot: SlotSummary): void {
    this.deleteState.openDeleteModal(slot);
  }

  closeDeleteModal(): void {
    this.deleteState.closeDeleteModal();
  }

  confirmDelete(): void {
    const parkingId = this.parkingId();
    if (!parkingId) {
      return;
    }

    this.deleteState.confirmDelete(
      parkingId,
      this.selectedIds(),
      () => this.selectionState.clear(),
      (id) => this.selectionState.remove(id)
    );
  }

  // ─── modals: metadata batch ───
  openMetadataModal(): void {
    if (this.selectedCount() === 0) {
      return;
    }
    this.metadataModalOpen.set(true);
  }

  closeMetadataModal(): void {
    this.metadataModalOpen.set(false);
  }

  updateSlotsMetadata(payload: {
    hasCharger?: boolean;
    isAccessible?: boolean;
    isActive?: boolean;
    slotIds: string[];
  }): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }

    this.slotsService.updateSlotMetadata(payload).subscribe({
      error: () => {
        this.toast?.showToast({
          message: "Error al actualizar equipamiento",
          type: "error",
        });
      },
      next: () => {
        this.closeMetadataModal();
        this.selectionState.clear();
        this.toast?.showToast({
          message: "Equipamiento actualizado",
          type: "success",
        });
      },
    });
  }

  // ─── modals: group edit ───
  openGroupModal(zone?: string, prefix?: string): void {
    if (zone !== undefined && prefix !== undefined) {
      this.groupTarget.set({ prefix, zone });
    } else {
      const selected = this.selectedSlots();
      if (selected.length > 0) {
        this.groupTarget.set({
          prefix: selected[0].prefix,
          zone: selected[0].zone,
        });
      } else {
        this.groupTarget.set(null);
      }
    }
    this.groupModalOpen.set(true);
  }

  closeGroupModal(): void {
    this.groupModalOpen.set(false);
    this.groupTarget.set(null);
  }

  updateSlotGroup(payload: {
    currentPrefix: string;
    currentZone: string;
    newPrefix?: string;
    newZone?: string;
    parkingId: string;
  }): void {
    this.slotsService.updateSlotGroup(payload).subscribe({
      error: () => {
        this.toast?.showToast({
          message: "Error al actualizar grupo",
          type: "error",
        });
      },
      next: () => {
        this.closeGroupModal();
        this.toast?.showToast({
          message: "Grupo actualizado",
          type: "success",
        });
      },
    });
  }
}
