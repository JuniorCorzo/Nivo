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
  selector: "table[nv-table]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "w-full caption-bottom text-sm text-[var(--foreground)]";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
