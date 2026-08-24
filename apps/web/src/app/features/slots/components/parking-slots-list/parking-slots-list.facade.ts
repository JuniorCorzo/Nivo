import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { SlotStatus, SlotSummary } from '@core/models/slot.model';
import { ParkingService } from '@core/services/parking-service';
import { SlotService } from '@core/services/slot-service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import {
  SLOT_STATUS_FILTER_OPTIONS,
  SLOT_TYPE_OPTIONS,
  SLOT_ZONE_FILTER_OPTIONS,
  displayOptionFn,
  valueOptionFn,
} from '../../shared/parking-slot-presentations';

import { SlotsSelectionState } from './slots-selection.state';
import { SlotsTableState } from './slots-table.state';
import {
  SlotDeleteState,
  getDeleteModalCopy,
  requiresDeleteConfirm,
} from '../slot-delete-modal/slots-delete.state';
import {
  SlotStatusState,
  getStatusModalCopy,
  getStatusTransitionOptions,
  VALID_STATUS_TRANSITIONS,
} from '../slot-status-modal/slot-status.state';

export {
  getDeleteModalCopy,
  requiresDeleteConfirm,
  getStatusModalCopy,
  getStatusTransitionOptions,
  VALID_STATUS_TRANSITIONS,
};

export type DrawerTab = 'general' | 'history';

export function getHistoryCopy(slot: SlotSummary | null): {
  empty: boolean;
  title?: string;
  message?: string;
} {
  if (!slot) return { empty: true };
  if (!slot.hasHistory) return { empty: true, message: 'Sin historial de tickets' };
  return {
    empty: false,
    title: 'Esta plaza tiene tickets previos.',
    message: 'El detalle de tickets no está disponible en esta vista.',
  };
}

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

  // ─── drawer & route specific signals ───
  readonly drawerSlotId = signal<string | null>(null);
  readonly drawerTab = signal<DrawerTab>('general');
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

  readonly table = this.tableState.initTable(() => this.slots());

  readonly filteredSlots = computed(() => this.table.getRowModel().rows.map((row) => row.original));

  readonly pageCount = computed(() => this.table.getPageCount());

  readonly drawerSlot = computed(() => {
    const id = this.drawerSlotId();
    return id ? (this.slots().find((slot) => slot.id === id) ?? null) : null;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.route.paramMap.pipe(takeUntilDestroyed(destroyRef)).subscribe((params) => {
      this.parkingId.set(params.get('parkingId'));
      this.drawerSlotId.set(params.get('slotId'));
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
    if (!parking) return;
    this.router.navigate([APP_ROUTES.app.createParkingLotSlot(parking.id)]);
  }

  onEdit(slotId: string): void {
    const parking = this.parking();
    if (!parking) return;
    this.router.navigate([APP_ROUTES.app.editParkingLotSlot(parking.id, slotId)]);
  }

  openDrawer(slotId: string): void {
    const parking = this.parking();
    if (!parking) return;
    this.drawerTab.set('general');
    this.router.navigate([APP_ROUTES.app.parkingLotSlotDetail(parking.id, slotId)]);
  }

  closeDrawer(): void {
    const parking = this.parking();
    if (!parking) return;
    this.router.navigate([APP_ROUTES.app.parkingLotSlots(parking.id)]);
  }

  setDrawerTab(tab: DrawerTab): void {
    this.drawerTab.set(tab);
  }

  // ─── filters ───
  onQueryInput(event: Event): void {
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
    if (!parkingId) return;
    this.statusState.confirmStatusChange(parkingId);
  }

  // ─── modals: delete ───
  openBatchDeleteModal(): void {
    const first = this.filteredSlots().find((slot) => this.selectedIds().has(slot.id));
    if (!first) return;
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
    if (!parkingId) return;

    this.deleteState.confirmDelete(
      parkingId,
      this.selectedIds(),
      () => this.selectionState.clear(),
      (id) => this.selectionState.remove(id),
    );
  }
}
