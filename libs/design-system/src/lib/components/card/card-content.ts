import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-card-content",
  standalone: true,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardContentComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "p-6 pt-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
