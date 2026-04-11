import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table-head",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<th [class]="classes()"><ng-content /></th>`,
})
export class TableHeadComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base =
      "h-12 px-4 text-left align-middle font-medium text-[var(--muted-foreground)] [&:has([role=checkbox])]:pr-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
