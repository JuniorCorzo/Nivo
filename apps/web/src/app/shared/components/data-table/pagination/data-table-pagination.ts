import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
} from "@ng-icons/lucide";
import { ButtonComponent, SelectComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { RowData, Table } from "@tanstack/angular-table";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, SelectComponent, NgIcon],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
    }),
  ],
  selector: "app-data-table-pagination",
  standalone: true,
  templateUrl: "./data-table-pagination.html",
})
export class DataTablePaginationComponent<TData extends RowData> {
  readonly texts = APP_TEXTS.dataTable.pagination;

  readonly table = input.required<Table<TData>>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);

  readonly currentPage = computed(
    () => this.table().getState().pagination.pageIndex + 1
  );
  readonly totalPages = computed(() =>
    Math.max(1, this.table().getPageCount())
  );
  readonly pageSizeString = computed(() =>
    this.table().getState().pagination.pageSize.toString()
  );

  readonly displaySizeFn = String;
  readonly valueSizeFn = String;

  goToFirstPage(): void {
    if (this.table().getCanPreviousPage()) {
      this.table().setPageIndex(0);
    }
  }

  goToPreviousPage(): void {
    if (this.table().getCanPreviousPage()) {
      this.table().previousPage();
    }
  }

  goToNextPage(): void {
    if (this.table().getCanNextPage()) {
      this.table().nextPage();
    }
  }

  goToLastPage(): void {
    if (this.table().getCanNextPage()) {
      this.table().setPageIndex(this.table().getPageCount() - 1);
    }
  }

  onPageSizeChange(sizeStr: string): void {
    const size = Number(sizeStr);
    if (size > 0) {
      this.table().setPageSize(size);
    }
  }
}
