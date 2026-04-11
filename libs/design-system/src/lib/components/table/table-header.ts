import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  selector: "nv-table-header",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<thead [class]="classes()"><ng-content /></thead>`,
})
export class TableHeaderComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "[&_tr]:border-b";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
