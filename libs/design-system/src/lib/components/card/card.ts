import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
  },
  selector: "nv-card",
  standalone: true,
  template: `<ng-content />`,
})
export class CardComponent {}
