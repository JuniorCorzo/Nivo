import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideInbox, lucideRotateCcw } from "@ng-icons/lucide";
import { ButtonComponent, TypographyH4, TypographyMuted } from "@nivo-sass/design-system";
import {
  DataTableComponent,
  DataTablePaginationComponent,
  EmptyStateDirective,
} from "@shared/components/data-table";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { Table } from "@tanstack/angular-table";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    DataTablePaginationComponent,
    EmptyStateDirective,
    ButtonComponent,
    TypographyH4,
    TypographyMuted,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideInbox,
      lucideRotateCcw,
    }),
  ],
  selector: "app-tickets-table",
  standalone: true,
  templateUrl: "./tickets-table.html",
})
export class TicketsTableComponent {
  readonly texts = APP_TEXTS.tickets;

  readonly table = input.required<Table<TicketSummary>>();
  readonly isLoading = input<boolean>(false);

  readonly selectTicket = output<TicketSummary>();
  readonly reprintReceipt = output<TicketSummary>();
  readonly resetFilters = output();
}
