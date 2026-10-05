import { Injectable, signal } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import type {
  ColumnFilter,
  ColumnFiltersState,
  PaginationState,
  Updater,
} from "@tanstack/angular-table";
import {
  createAngularTable,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/angular-table";

import type { ParkingSlotColumnOptions } from "./parking-slot-column-definition";
import { parkingSlotColumnDefinition } from "./parking-slot-column-definition";

@Injectable()
export class SlotsTableState {
  readonly globalFilter = signal("");
  readonly columnFilters = signal<ColumnFiltersState>([]);
  readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  initTable(
    slotsSignal: () => SlotSummary[],
    options: ParkingSlotColumnOptions = {}
  ) {
    return createAngularTable(() => ({
      columns: parkingSlotColumnDefinition(options),
      data: slotsSignal(),
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      globalFilterFn: (row, _columnId, filterValue: string) => {
        const val = filterValue.trim().toLowerCase();
        if (!val) {
          return true;
        }
        const slotNumber = String(row.original.slotNumber ?? "").toLowerCase();
        const zone = String(row.original.zone ?? "").toLowerCase();
        return slotNumber.includes(val) || zone.includes(val);
      },
      onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
        this.columnFilters.set(functionalUpdate(updater, this.columnFilters()));
      },
      onGlobalFilterChange: (updater: Updater<string>) => {
        this.globalFilter.set(functionalUpdate(updater, this.globalFilter()));
      },
      onPaginationChange: (updater: Updater<PaginationState>) => {
        this.pagination.set(functionalUpdate(updater, this.pagination()));
      },
      state: {
        columnFilters: this.columnFilters(),
        globalFilter: this.globalFilter(),
        pagination: this.pagination(),
      },
    }));
  }

  columnFilterValue(key: string): string | boolean | undefined {
    /* SAFETY: Filter value in columnFilters is stored as string or boolean */
    return this.columnFilters().find(
      (filter: ColumnFilter) => filter.id === key
    )?.value as string | boolean | undefined;
  }

  setFilter(key: string, value: unknown): void {
    this.columnFilters.update((current) => {
      const next = current.filter((filter: ColumnFilter) => filter.id !== key);
      if (value !== undefined && value !== null && value !== "") {
        next.push({ id: key, value });
      }
      return next;
    });
  }

  clear(): void {
    this.globalFilter.set("");
    this.columnFilters.set([]);
    this.pagination.set({ pageIndex: 0, pageSize: 10 });
  }
}
