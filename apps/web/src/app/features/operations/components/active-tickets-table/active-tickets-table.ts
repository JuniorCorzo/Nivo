import { CommonModule, DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideLogOut,
  lucideQrCode,
  lucideSearch,
  lucideTicket,
  lucideX,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, CommonModule, DatePipe, NgIcon],
  providers: [
    provideIcons({
      lucideLogOut,
      lucideQrCode,
      lucideSearch,
      lucideTicket,
      lucideX,
    }),
  ],
  selector: "app-operations-active-tickets-table",
  standalone: true,
  templateUrl: "./active-tickets-table.html",
})
export class OperationsActiveTicketsTableComponent {
  readonly texts = APP_TEXTS.operations.activeTickets;

  readonly filteredActiveTickets = input.required<TicketSummary[]>();
  readonly searchTicketQuery = input<string>("");

  readonly searchTicketQueryChange = output<string>();
  readonly submitExpressCheckOut = output();
  readonly openQrScanner = output();
  readonly checkOutWithTicket = output<TicketSummary>();

  onSearchInput(event: Event): void {
    /* SAFETY: Target is guaranteed HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.searchTicketQueryChange.emit(target.value);
  }

  onClearSearch(): void {
    this.searchTicketQueryChange.emit("");
  }

  onSubmitCheckOut(): void {
    this.submitExpressCheckOut.emit();
  }

  onScanQr(): void {
    this.openQrScanner.emit();
  }

  onTicketCheckOut(ticket: TicketSummary): void {
    this.checkOutWithTicket.emit(ticket);
  }
}
