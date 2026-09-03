import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-card-header",
  standalone: true,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardHeaderComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "flex flex-col space-y-1.5 p-6";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
