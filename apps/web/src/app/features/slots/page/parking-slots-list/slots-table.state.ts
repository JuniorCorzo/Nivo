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

import { parkingSlotColumnDefinition } from "./parking-slot-column-definition";

@Injectable()
export class SlotsTableState {
  readonly globalFilter = signal("");
  readonly columnFilters = signal<ColumnFiltersState>([]);
  readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  initTable(slotsSignal: () => SlotSummary[]) {
    return createAngularTable(() => ({
      columns: parkingSlotColumnDefinition(),
      data: slotsSignal(),
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      globalFilterFn: "includesString",
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

  columnFilterValue(key: string): string {
    return String(
      this.columnFilters().find((filter: ColumnFilter) => filter.id === key)
        ?.value ?? ""
    );
  }

  setFilter(key: string, value: string): void {
    this.columnFilters.update((current) => {
      const next = current.filter((filter: ColumnFilter) => filter.id !== key);
      if (value) {
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
