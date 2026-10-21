import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideChevronUp } from "@ng-icons/lucide";
import {
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { RowData, Table } from "@tanstack/angular-table";
import { FlexRender } from "@tanstack/angular-table";

import { EmptyStateDirective } from "../directives/empty-state.directive";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FlexRender,
    NgIcon,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
  ],
  providers: [
    provideIcons({
      lucideChevronDown,
      lucideChevronUp,
    }),
  ],
  selector: "app-data-table",
  standalone: true,
  templateUrl: "./data-table.html",
})
export class DataTableComponent<TData extends RowData> {
  readonly texts = APP_TEXTS.dataTable;

  readonly table = input.required<Table<TData>>();
  readonly isLoading = input<boolean>(false);
  readonly emptyMessage = input<string>(
    APP_TEXTS.dataTable.empty.defaultMessage
  );
  readonly rowClickable = input<boolean>(false);

  readonly rowClick = output<TData>();

  protected readonly customEmptyState = contentChild(EmptyStateDirective);
  protected readonly skeletonRows = Array.from({ length: 5 });

  protected onRowClick(row: TData): void {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }
}
