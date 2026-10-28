import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCreditCard,
  lucideEye,
  lucidePrinter,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideEye,
      lucidePrinter,
    }),
  ],
  selector: "app-ticket-row-actions",
  standalone: true,
  template: `
    <div class="flex items-center justify-end gap-1.5">
      @if (ticket().status === "OPEN") {
        <nv-button
          type="button"
          variant="default"
          size="sm"
          class="h-7 gap-1 px-2 text-xs font-semibold"
          [title]="texts.checkout"
          [attr.aria-label]="texts.checkout"
          (click)="selectTicket.emit(ticket())"
        >
          <ng-icon name="lucideCreditCard" size="14" />
          <span>{{ texts.checkout }}</span>
        </nv-button>
      }
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
  readonly texts = {
    ...APP_TEXTS.tickets.actions,
    checkout: "Cobrar",
  };

  readonly ticket = input.required<TicketSummary>();
  readonly selectTicket = output<TicketSummary>();
  readonly reprintReceipt = output<TicketSummary>();
}
