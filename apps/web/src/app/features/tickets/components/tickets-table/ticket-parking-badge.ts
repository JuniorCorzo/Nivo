import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { BadgeComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-ticket-parking-badge",
  standalone: true,
  template: ` <nv-badge variant="outline">{{ name() || "—" }}</nv-badge> `,
})
export class TicketParkingBadgeComponent {
  readonly name = input<string | undefined>();
}
