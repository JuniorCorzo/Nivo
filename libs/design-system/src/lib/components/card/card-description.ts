import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block text-sm text-[var(--muted-foreground)] font-sans",
  },
  selector: "nv-card-description",
  standalone: true,
  template: `<ng-content />`,
})
export class CardDescriptionComponent {}
