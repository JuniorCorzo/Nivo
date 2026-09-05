import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex items-center p-6 pt-0",
  },
  selector: "nv-card-footer",
  standalone: true,
  template: `<ng-content />`,
})
export class CardFooterComponent {}
