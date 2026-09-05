import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block font-semibold leading-none tracking-tight font-sans",
  },
  selector: "nv-card-title",
  standalone: true,
  template: `<ng-content />`,
})
export class CardTitleComponent {}
