import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "td[nv-table-cell]",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    "[class]": "classes()",
  },
})
export class TableCellComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "px-4 py-1.5 align-middle [&:has([role=checkbox])]:pr-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
