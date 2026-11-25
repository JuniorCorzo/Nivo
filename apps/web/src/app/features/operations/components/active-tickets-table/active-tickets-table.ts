import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideLogOut,
  lucideQrCode,
  lucideSearch,
  lucideTicket,
  lucideX,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  InputComponent,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    ButtonComponent,
    DatePipe,
    FormsModule,
    InputComponent,
    NgIcon,
  ],
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

  readonly kbdClass =
    "border-border bg-muted text-muted-foreground ml-1.5 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline-block";

  getCountryBadgeVariant(
    ticket: TicketSummary
  ): "info" | "outline" | "warning" {
    if (ticket.plateCountry === "VE") {
      return "info";
    }
    if (ticket.plateCountry === "UNPLATED") {
      return "warning";
    }
    return "outline";
  }

  getCountryBadgeLabel(ticket: TicketSummary): string {
    if (ticket.plateCountry === "UNPLATED") {
      return this.texts.unplatedShortBadge;
    }
    return ticket.plateCountry || this.texts.defaultCountryBadge;
  }

  onSearchChange(value: string): void {
    this.searchTicketQueryChange.emit(value);
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
