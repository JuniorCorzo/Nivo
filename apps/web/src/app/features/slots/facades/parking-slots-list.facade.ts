import { DestroyRef, Injectable, computed, effect, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import type { SlotStatus, SlotSummary } from "@core/models/slot.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { SlotDeleteState } from "../components/modals/slot-delete-modal/slots-delete.state";
import type { SlotGroupOption } from "../components/modals/slot-group-edit-modal/slot-group-edit-modal";
import { SlotStatusState } from "../components/modals/slot-status-modal/slot-status.state";
import { SlotsSelectionState } from "../page/parking-slots-list/slots-selection.state";
import { SlotsTableState } from "../page/parking-slots-list/slots-table.state";
import type { Option } from "../shared/parking-slot-presentations";
import {
  SLOT_STATUS_FILTER_OPTIONS,
  SLOT_TYPE_FILTER_OPTIONS,
  SLOT_ZONE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from "../shared/parking-slot-presentations";
import type { DrawerTab } from "./slot-drawer.state";
import { SlotDrawerState } from "./slot-drawer.state";
import { SlotGroupState } from "./slot-group.state";
import { SlotMetadataBatchState } from "./slot-metadata-batch.state";

export {
  getDeleteModalCopy,
  requiresDeleteConfirm,
} from "../components/modals/slot-delete-modal/slots-delete.state";
export {
  getStatusModalCopy,
  getStatusTransitionOptions,
  VALID_STATUS_TRANSITIONS,
} from "../components/modals/slot-status-modal/slot-status.state";
export type { SlotGroupOption } from "../components/modals/slot-group-edit-modal/slot-group-edit-modal";
export { getHistoryCopy, SlotDrawerState } from "./slot-drawer.state";
export type { DrawerTab, HistoryCopy } from "./slot-drawer.state";
export { SlotGroupState } from "./slot-group.state";
export { SlotMetadataBatchState } from "./slot-metadata-batch.state";

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
  private readonly metadataBatchState = inject(SlotMetadataBatchState);
  private readonly groupState = inject(SlotGroupState);
  private readonly drawerState = inject(SlotDrawerState);

  // ─── filter options ───
  readonly typeOptions = SLOT_TYPE_FILTER_OPTIONS;
  readonly zoneOptions = computed<Option[]>(() => {
    const zones = new Set(
      this.slots()
        .map((s) => s.zone)
        .filter((z): z is string => Boolean(z)),
    );
    if (zones.size === 0) {
      return SLOT_ZONE_FILTER_OPTIONS;
    }
    return [
      { label: "Zona: Todas", value: "" },
      ...[...zones].toSorted((a, b) => a.localeCompare(b)).map((z) => ({ label: z, value: z })),
    ];
  });
  readonly statusOptions = SLOT_STATUS_FILTER_OPTIONS;
  readonly displayOptionFn = displayOptionFn;
  readonly valueOptionFn = valueOptionFn;

  readonly isAccessibleFilter = computed<boolean>(() => {
    const val = this.tableState.columnFilterValue("isAccessible");
    return val === true;
  });

  readonly hasChargerFilter = computed<boolean>(() => {
    const val = this.tableState.columnFilterValue("hasCharger");
    return val === true;
  });

  // ─── delegated table & filter signals ───
  readonly globalFilter = this.tableState.globalFilter;
  readonly columnFilters = this.tableState.columnFilters;
  readonly pagination = this.tableState.pagination;

  // ─── delegated selection signals ───
  readonly selectedIds = this.selectionState.selectedIds;
  readonly selectedCount = this.selectionState.selectedCount;
  readonly allSelected = computed(() => this.selectionState.allSelected(this.filteredSlots()));

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

  // ─── delegated metadata batch signals ───
  readonly metadataModalOpen = this.metadataBatchState.metadataModalOpen;
  readonly selectedSlots = computed(() =>
    this.slots().filter((slot) => this.selectedIds().has(slot.id)),
  );

  // ─── delegated group edit signals ───
  readonly groupModalOpen = this.groupState.groupModalOpen;
  readonly groupTarget = this.groupState.groupTarget;
  readonly availableGroups = computed<SlotGroupOption[]>(() =>
    this.groupState.availableGroups(this.slots()),
  );

  // ─── delegated drawer & route specific signals ───
  readonly drawerSlotId = this.drawerState.drawerSlotId;
  readonly drawerTab = this.drawerState.drawerTab;
  private readonly parkingId = signal<string | null>(null);

  readonly parking = computed(() => {
    const parkingId = this.parkingId();
    return parkingId
      ? (this.parkingService.parkingLots().find((parking) => parking.id === parkingId) ?? null)
      : null;
  });

  readonly slots = computed(() => {
    const parkingId = this.parkingId();
    return parkingId ? (this.slotsService.summaries()[parkingId] ?? []) : [];
  });

  readonly table = this.tableState.initTable(() => this.slots(), {
    allSelected: () => this.allSelected(),
    isSelected: (id: string) => this.selectedIds().has(id),
    onChangeStatus: (slot) => this.openStatusModal(slot),
    onDelete: (slot) => this.openDeleteModal(slot),
    onEdit: (slot) => this.onEdit(slot.id),
    onToggleAll: (event) => this.toggleAll(event),
    onToggleSelected: (id, event) => this.toggleSelected(id, event),
    onViewDetail: (slot) => this.openDrawer(slot.id),
  });

  readonly filteredSlots = computed(() => this.table.getRowModel().rows.map((row) => row.original));

  readonly pageCount = computed(() => this.table.getPageCount());

  readonly drawerSlot = computed(() => this.drawerState.drawerSlot(this.slots()));

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.route.paramMap.pipe(takeUntilDestroyed(destroyRef)).subscribe((params) => {
      this.parkingId.set(params.get("parkingId"));
      this.drawerSlotId.set(params.get("slotId"));
    });

    effect((onCleanup) => {
      const parking = this.parking();
      if (!parking) {
        return;
      }

      const sub = this.slotsService.getAllSlotSummariesByParkingId(parking.id).subscribe();

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
    this.router.navigate([APP_ROUTES.app.editParkingLotSlot(parking.id, slotId)]);
  }

  openDrawer(slotId: string): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.drawerState.openDrawer(parking.id, slotId);
  }

  closeDrawer(): void {
    const parking = this.parking();
    if (!parking) {
      return;
    }
    this.drawerState.closeDrawer(parking.id);
  }

  setDrawerTab(tab: DrawerTab): void {
    this.drawerState.setDrawerTab(tab);
  }

  // ─── filters ───
  onQueryInput(event: Event): void {
    /* SAFETY: event.target is guaranteed to be an HTMLInputElement for input event */
    this.tableState.globalFilter.set((event.target as HTMLInputElement).value);
  }

  columnFilterValue(key: string): string {
    const val = this.tableState.columnFilterValue(key);
    return val !== undefined && val !== null ? String(val) : "";
  }

  setFilter(key: string, value: unknown): void {
    this.tableState.setFilter(key, value);
  }

  clearFilters(): void {
    this.tableState.clear();
    this.selectionState.clear();
  }

  toggleAccessibleFilter(): void {
    const current = this.isAccessibleFilter();
    this.setFilter("isAccessible", current === true ? undefined : true);
  }

  toggleChargerFilter(): void {
    const current = this.hasChargerFilter();
    this.setFilter("hasCharger", current === true ? undefined : true);
  }

  // ─── pagination ───
  setPageIndex(index: number): void {
    this.tableState.pagination.update((p) => ({ ...p, pageIndex: index }));
  }

  // ─── selection ───
  toggleSelected(slotId: string, event: Event | boolean): void {
    this.selectionState.toggleSelected(slotId, event);
  }

  toggleAll(event: Event | boolean): void {
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
    const first = this.filteredSlots().find((slot) => this.selectedIds().has(slot.id));
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
      (id) => this.selectionState.remove(id),
    );
  }

  // ─── modals: metadata batch ───
  openMetadataModal(): void {
    this.metadataBatchState.openMetadataModal(this.selectedCount());
  }

  closeMetadataModal(): void {
    this.metadataBatchState.closeMetadataModal();
  }

  updateSlotsMetadata(payload: {
    hasCharger?: boolean;
    isAccessible?: boolean;
    isActive?: boolean;
    slotIds: string[];
  }): void {
    this.metadataBatchState.updateSlotsMetadata(payload, this.parkingId(), () =>
      this.selectionState.clear(),
    );
  }

  // ─── modals: group edit ───
  openGroupModal(zone?: string, prefix?: string): void {
    this.groupState.openGroupModal(this.selectedSlots(), zone, prefix);
  }

  closeGroupModal(): void {
    this.groupState.closeGroupModal();
  }

  updateSlotGroup(payload: {
    currentPrefix: string;
    currentZone: string;
    newPrefix?: string;
    newZone?: string;
    parkingId: string;
  }): void {
    this.groupState.updateSlotGroup(payload, this.slots());
  }
}
