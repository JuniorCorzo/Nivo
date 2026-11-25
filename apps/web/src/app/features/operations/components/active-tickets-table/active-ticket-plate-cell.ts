import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-active-ticket-plate-cell",
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <span
        class="text-foreground font-mono text-sm font-bold tracking-wider tabular-nums"
      >
        {{ licensePlate() }}
      </span>
      <nv-badge
        [variant]="badgeVariant()"
        class="px-1.5 py-0.5 font-mono text-[10px] font-bold"
      >
        {{ badgeLabel() }}
      </nv-badge>
    </div>
  `,
})
export class ActiveTicketPlateCellComponent {
  readonly texts = APP_TEXTS.operations.activeTickets;

  readonly licensePlate = input.required<string>();
  readonly plateCountry = input<TicketSummary["plateCountry"]>();

  readonly badgeVariant = computed<"info" | "outline" | "warning">(() => {
    const country = this.plateCountry();
    if (country === "VE") {
      return "info";
    }
    if (country === "UNPLATED") {
      return "warning";
    }
    return "outline";
  });

  readonly badgeLabel = computed(() => {
    const country = this.plateCountry();
    if (country === "UNPLATED") {
      return this.texts.unplatedShortBadge;
    }
    return country || this.texts.defaultCountryBadge;
  });
}
