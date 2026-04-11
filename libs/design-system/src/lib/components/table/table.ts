import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full overflow-auto">
      <table [class]="classes()">
        <ng-content />
      </table>
    </div>
  `,
})
export class TableComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "w-full table-fixed caption-bottom text-sm text-[var(--foreground)]";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
