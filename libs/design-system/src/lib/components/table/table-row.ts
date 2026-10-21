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
  selector: "tr[nv-table-row]",
  standalone: true,
  template: `<ng-content />`,
})
export class TableRowComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base =
      "border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/50 data-[state=selected]:bg-[var(--muted)]";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
