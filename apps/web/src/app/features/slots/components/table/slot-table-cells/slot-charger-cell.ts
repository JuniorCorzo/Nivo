import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlugZap2 } from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, NgIcon],
  providers: [
    provideIcons({
      lucidePlugZap2,
    }),
  ],
  selector: "app-slot-charger-cell",
  standalone: true,
  template: `
    @if (hasCharger()) {
      <nv-badge class="gap-1" variant="info">
        <ng-icon name="lucidePlugZap2" size="18" />
        eléctrico
      </nv-badge>
    } @else {
      <nv-badge variant="outline">Estándar</nv-badge>
    }
  `,
})
export class SlotChargerCellComponent {
  readonly hasCharger = input.required<boolean>();
}
