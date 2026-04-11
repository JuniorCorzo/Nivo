import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table-body",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<tbody [class]="classes()"><ng-content /></tbody>`,
})
export class TableBodyComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "[&_tr:last-child]:border-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
