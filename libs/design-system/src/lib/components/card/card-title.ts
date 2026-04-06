import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from "@angular/core";
import { TypographyH1 } from "../typography";

@Component({
  selector: "nv-card-title",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nv-h1 [class]="classes()"><ng-content /></nv-h1>`,
  imports: [TypographyH1],
})
export class CardTitleComponent {
  readonly class = input<string>("");
  readonly classes = computed(() => {
    const base = "";
    return this.class() ? `${base} ${this.class()}`.trim() : base;
  });
}
