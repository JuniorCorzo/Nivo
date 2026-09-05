import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex flex-col space-y-1.5 p-6",
  },
  selector: "nv-card-header",
  standalone: true,
  template: `<ng-content />`,
})
export class CardHeaderComponent {}
