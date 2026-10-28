import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-ticket-status-badge",
  standalone: true,
  template: `
    @if (status() === "OPEN") {
      <nv-badge variant="success" class="inline-flex items-center gap-1.5">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        {{ texts.open }}
      </nv-badge>
    } @else if (status() === "CLOSED") {
      <nv-badge variant="secondary">{{ texts.closed }}</nv-badge>
    } @else {
      <nv-badge variant="outline">{{ status() }}</nv-badge>
    }
  `,
})
export class TicketStatusBadgeComponent {
  readonly texts = APP_TEXTS.tickets.status;

  readonly status = input.required<string>();
}
