import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-ticket-vehicle-badge",
  standalone: true,
  template: ` <nv-badge variant="secondary">{{ label() }}</nv-badge> `,
})
export class TicketVehicleBadgeComponent {
  readonly texts = APP_TEXTS.tickets.filters.vehicle;

  readonly slotType = input<string | undefined>();

  readonly label = computed(() => {
    const val = this.slotType();
    if (val === "CAR") {
      return this.texts.car;
    }
    if (val === "MOTORCYCLE") {
      return this.texts.motorcycle;
    }
    if (val === "BICYCLE") {
      return this.texts.bicycle;
    }
    return val || "—";
  });
}
