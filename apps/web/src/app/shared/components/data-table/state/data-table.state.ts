import { Injectable, signal } from "@angular/core";
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFnOption,
  PaginationState,
  RowData,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/angular-table";
import {
  createAngularTable,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/angular-table";

export interface CreateTableOptions<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[] | (() => ColumnDef<TData, any>[]);
  data: () => TData[];
  getRowId?: (row: TData) => string;
  globalFilterFn?: FilterFnOption<TData>;
  initialVisibility?: VisibilityState;
}

@Injectable()
export class DataTableState<TData extends RowData> {
  readonly globalFilter = signal<string>("");
  readonly columnFilters = signal<ColumnFiltersState>([]);
  readonly pagination = signal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  readonly sorting = signal<SortingState>([]);
  readonly columnVisibility = signal<VisibilityState>({});

  setGlobalFilter(value: string): void {
    this.globalFilter.set(value);
    this.pagination.update((prev) => ({ ...prev, pageIndex: 0 }));
  }

  setColumnFilter(id: string, value: unknown): void {
    this.columnFilters.update((filters) => {
      const remaining = filters.filter((f) => f.id !== id);
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "ALL"
      ) {
        return remaining;
      }
      return [...remaining, { id, value }];
    });
    this.pagination.update((prev) => ({ ...prev, pageIndex: 0 }));
  }

  getColumnFilterValue<TFilterValue = string>(
    id: string
  ): TFilterValue | undefined {
    const filter = this.columnFilters().find((f) => f.id === id);
    if (!filter) {
      return undefined;
    }
    /* SAFETY: Caller supplies the expected domain type for the column filter value */
    return filter.value as TFilterValue;
  }

  resetFilters(): void {
    this.globalFilter.set("");
    this.columnFilters.set([]);
    this.pagination.update((prev) => ({ ...prev, pageIndex: 0 }));
  }

  createTable(options: CreateTableOptions<TData>): Table<TData> {
    if (options.initialVisibility) {
      this.columnVisibility.set(options.initialVisibility);
    }

    return createAngularTable(() => {
      const resolvedColumns = Array.isArray(options.columns)
        ? options.columns
        : options.columns();

      return {
        columns: resolvedColumns,
        data: options.data(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId: options.getRowId,
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: options.globalFilterFn,
        onColumnFiltersChange: (updater) => {
          this.columnFilters.update((prev) => functionalUpdate(updater, prev));
        },
        onColumnVisibilityChange: (updater) => {
          this.columnVisibility.update((prev) =>
            functionalUpdate(updater, prev)
          );
        },
        onGlobalFilterChange: (updater) => {
          this.globalFilter.update((prev) => functionalUpdate(updater, prev));
        },
        onPaginationChange: (updater) => {
          this.pagination.update((prev) => functionalUpdate(updater, prev));
        },
        onSortingChange: (updater) => {
          this.sorting.update((prev) => functionalUpdate(updater, prev));
        },
        state: {
          columnFilters: this.columnFilters(),
          columnVisibility: this.columnVisibility(),
          globalFilter: this.globalFilter(),
          pagination: this.pagination(),
          sorting: this.sorting(),
        },
      };
    });
  }
}
