import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block p-6 pt-0",
  },
  selector: "nv-card-content",
  standalone: true,
  template: `<ng-content />`,
})
export class CardContentComponent {}
