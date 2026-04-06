import { Component, ChangeDetectionStrategy } from "@angular/core";

import { input, computed } from "@angular/core";

@Component({
  selector: "nv-card-content",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardContentComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "p-6 pt-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
