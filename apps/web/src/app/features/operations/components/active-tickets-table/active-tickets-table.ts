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
import {
  DataTableComponent,
  EmptyStateDirective,
} from "@shared/components/data-table";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { createAngularTable, getCoreRowModel } from "@tanstack/angular-table";

import { createActiveTicketColumns } from "./active-tickets-columns.definition";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    ButtonComponent,
    DataTableComponent,
    EmptyStateDirective,
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

  readonly filteredActiveTickets = input<TicketSummary[]>([]);
  readonly searchTicketQuery = input<string>("");

  readonly searchTicketQueryChange = output<string>();
  readonly submitExpressCheckOut = output();
  readonly openQrScanner = output();
  readonly checkOutWithTicket = output<TicketSummary>();

  readonly kbdClass =
    "border-border bg-muted text-muted-foreground ml-1.5 hidden rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline-block";

  private readonly columns = createActiveTicketColumns({
    onCheckOut: (ticket) => this.onTicketCheckOut(ticket),
  });

  readonly table = createAngularTable(() => ({
    columns: this.columns,
    data: this.filteredActiveTickets(),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  }));

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
