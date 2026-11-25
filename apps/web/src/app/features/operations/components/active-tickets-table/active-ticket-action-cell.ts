import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideLogOut } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [provideIcons({ lucideLogOut })],
  selector: "app-active-ticket-action-cell",
  standalone: true,
  template: `
    <div class="flex items-center justify-end">
      <nv-button
        size="sm"
        variant="default"
        type="button"
        (click)="checkOut.emit(ticket())"
      >
        <ng-icon name="lucideLogOut" size="14" class="mr-1" />
        <span>{{ texts.collectButton }}</span>
      </nv-button>
    </div>
  `,
})
export class ActiveTicketActionCellComponent {
  readonly texts = APP_TEXTS.operations.activeTickets;

  readonly ticket = input.required<TicketSummary>();
  readonly checkOut = output<TicketSummary>();
}
