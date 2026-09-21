import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch, lucideX } from "@ng-icons/lucide";
import { ButtonComponent, InputComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { RowData, Table } from "@tanstack/angular-table";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideSearch,
      lucideX,
    }),
  ],
  selector: "app-data-table-search",
  standalone: true,
  templateUrl: "./data-table-search.html",
})
export class DataTableSearchComponent<TData extends RowData> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  readonly texts = APP_TEXTS.dataTable.search;

  readonly table = input.required<Table<TData>>();
  readonly placeholder = input<string>(APP_TEXTS.dataTable.search.placeholder);

  readonly searchValue = signal<string>("");

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.table().setGlobalFilter(value);
      });
  }

  onInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.searchValue.set(target.value);
      this.searchSubject.next(target.value);
    }
  }

  clear(): void {
    this.searchValue.set("");
    this.searchSubject.next("");
    this.table().setGlobalFilter("");
  }
}
