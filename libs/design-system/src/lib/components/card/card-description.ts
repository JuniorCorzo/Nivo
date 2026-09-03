import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-card-description",
  standalone: true,
  template: `<p [class]="classes()"><ng-content /></p>`,
})
export class CardDescriptionComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "text-sm text-(--muted-foreground) font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
