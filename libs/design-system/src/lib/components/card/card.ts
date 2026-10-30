import { ChangeDetectionStrategy, Component } from "@angular/core";

export { CardHeaderComponent } from "./card-header";
export { CardTitleComponent } from "./card-title";
export { CardDescriptionComponent } from "./card-description";
export { CardContentComponent } from "./card-content";
export { CardFooterComponent } from "./card-footer";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm font-sans",
  },
  selector: "nv-card",
  standalone: true,
  template: `<ng-content />`,
})
export class CardComponent {}
