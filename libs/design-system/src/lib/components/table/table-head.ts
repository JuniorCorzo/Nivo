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
  selector: "th[nv-table-head]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableHeadComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base =
      "h-12 px-4 text-left font-medium text-[var(--muted-foreground)] [&:has([role=checkbox])]:pr-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
