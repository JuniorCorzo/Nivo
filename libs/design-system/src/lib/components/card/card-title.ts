import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";

import { TypographyH1 } from "../typography";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypographyH1],
  selector: "nv-card-title",
  standalone: true,
  template: `<nv-h1 [class]="classes()"><ng-content /></nv-h1>`,
})
export class CardTitleComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "";
    return this.class() ? `${base} ${this.class()}`.trim() : base;
  });
}
