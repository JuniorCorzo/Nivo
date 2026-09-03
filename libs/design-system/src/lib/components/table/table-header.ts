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
  selector: "thead[nv-table-header]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableHeaderComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "[&_tr]:border-b";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
