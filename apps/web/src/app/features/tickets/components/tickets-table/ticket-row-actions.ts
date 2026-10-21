import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEye, lucidePrinter } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideEye,
      lucidePrinter,
    }),
  ],
  selector: "app-ticket-row-actions",
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-1">
      <nv-button
        type="button"
        variant="ghost"
        size="icon"
        [title]="texts.viewDetail"
        [attr.aria-label]="texts.viewDetail"
        (click)="selectTicket.emit(ticket())"
      >
        <ng-icon name="lucideEye" size="16" />
      </nv-button>
      <nv-button
        type="button"
        variant="ghost"
        size="icon"
        [title]="texts.reprintReceipt"
        [attr.aria-label]="texts.reprintReceipt"
        (click)="reprintReceipt.emit(ticket())"
      >
        <ng-icon name="lucidePrinter" size="16" />
      </nv-button>
    </div>
  `,
})
export class TicketRowActionsComponent {
  readonly texts = APP_TEXTS.tickets.actions;

  readonly ticket = input.required<TicketSummary>();
  readonly selectTicket = output<TicketSummary>();
  readonly reprintReceipt = output<TicketSummary>();
}
