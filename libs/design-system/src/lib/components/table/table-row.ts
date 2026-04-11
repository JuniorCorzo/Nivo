import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table-row",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<tr [class]="classes()"><ng-content /></tr>`,
})
export class TableRowComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base =
      "border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/50 data-[state=selected]:bg-[var(--muted)]";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
