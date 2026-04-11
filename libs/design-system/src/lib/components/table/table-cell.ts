import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table-cell",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<td [class]="classes()"><ng-content /></td>`,
})
export class TableCellComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base =
      "p-4 align-middle [&:has([role=checkbox])]:pr-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
