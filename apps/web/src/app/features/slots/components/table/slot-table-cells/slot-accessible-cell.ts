import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAccessibility, lucideMinus } from "@ng-icons/lucide";
import { BadgeComponent, TypographyMuted } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, NgIcon, TypographyMuted],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideMinus,
    }),
  ],
  selector: "app-slot-accessible-cell",
  standalone: true,
  template: `
    @if (isAccessible()) {
      <nv-badge class="gap-1" variant="outline">
        <ng-icon name="lucideAccessibility" size="16" />
        PMR
      </nv-badge>
    } @else {
      <nv-muted class="text-muted-foreground">
        <ng-icon name="lucideMinus" size="16"></ng-icon>
      </nv-muted>
    }
  `,
})
export class SlotAccessibleCellComponent {
  readonly isAccessible = input.required<boolean>();
}
