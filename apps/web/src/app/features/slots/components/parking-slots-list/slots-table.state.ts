import { Injectable, signal } from '@angular/core';
import {
  ColumnFilter,
  ColumnFiltersState,
  PaginationState,
  Updater,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/angular-table';
import { SlotSummary } from '@core/models/slot.model';
import { parkingSlotColumnDefinition } from './parking-slot-column-definition';

@Injectable()
export class SlotsTableState {
  readonly globalFilter = signal('');
  readonly columnFilters = signal<ColumnFiltersState>([]);
  readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  initTable(slotsSignal: () => SlotSummary[]) {
    return createAngularTable(() => ({
      data: slotsSignal(),
      columns: parkingSlotColumnDefinition(),
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      globalFilterFn: 'includesString',
      state: {
        globalFilter: this.globalFilter(),
        columnFilters: this.columnFilters(),
        pagination: this.pagination(),
      },
      onGlobalFilterChange: (updater: Updater<string>) => {
        this.globalFilter.set(this.resolveUpdater(updater, this.globalFilter()));
      },
      onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
        this.columnFilters.set(this.resolveUpdater(updater, this.columnFilters()));
      },
      onPaginationChange: (updater: Updater<PaginationState>) => {
        this.pagination.set(this.resolveUpdater(updater, this.pagination()));
      },
    }));
  }

  columnFilterValue(key: string): string {
    return String(
      this.columnFilters().find((filter: ColumnFilter) => filter.id === key)?.value ?? '',
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
    this.globalFilter.set('');
    this.columnFilters.set([]);
    this.pagination.set({ pageIndex: 0, pageSize: 10 });
  }

  private resolveUpdater<T>(
    updater: T | ((oldValue: T) => T),
    currentValue: T,
  ): T {
    return typeof updater === 'function'
      ? (updater as (oldValue: T) => T)(currentValue)
      : updater;
  }
}
