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
  selector: "tbody[nv-table-body]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableBodyComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "[&_tr:last-child]:border-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
