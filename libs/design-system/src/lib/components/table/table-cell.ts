import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
  selector: "td[nv-table-cell]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableCellComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "px-4 py-1.5 align-middle [&:has([role=checkbox])]:pr-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
