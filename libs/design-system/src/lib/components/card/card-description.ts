import { Component, ChangeDetectionStrategy } from "@angular/core";

import { input, computed } from "@angular/core";

@Component({
  selector: "nv-card-description",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p [class]="classes()"><ng-content /></p>`,
})
export class CardDescriptionComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "text-sm text-(--muted-foreground) font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
