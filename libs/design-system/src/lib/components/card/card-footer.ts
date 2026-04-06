import { Component, ChangeDetectionStrategy } from "@angular/core";

import { input, computed } from "@angular/core";

@Component({
  selector: "nv-card-footer",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="classes()"><ng-content /></div>`,
})
export class CardFooterComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "flex items-center p-6 pt-0";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
