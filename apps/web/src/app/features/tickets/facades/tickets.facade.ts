import { computed, inject, Injectable, signal } from "@angular/core";
import type {
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { TicketService } from "@core/services/ticket-service";
import { DataTableState } from "@shared/components/data-table";

import { createTicketColumns } from "../components/tickets-table/ticket-columns-definition";
import type { TicketFilterCriteria } from "../models/ticket-filter.model";
import { INITIAL_TICKET_FILTERS } from "../models/ticket-filter.model";

@Injectable()
export class TicketsFacade {
  private readonly ticketService = inject(TicketService);
  private readonly parkingService = inject(ParkingService);
  private readonly tableState = new DataTableState<TicketSummary>();

  readonly parkingLots = this.parkingService.parkingLots;
  readonly parkingId = signal<string | null>(null);
  readonly isTenantView = computed(() => !this.parkingId());
  readonly tickets = signal<TicketSummary[]>([]);
  readonly filters = signal<TicketFilterCriteria>(INITIAL_TICKET_FILTERS);
  readonly selectedTicket = signal<TicketSummary | null>(null);
  readonly liveRatePreview = signal<PriceDetailedModel | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isCalculatingRate = signal<boolean>(false);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly isReceiptOpen = signal<boolean>(false);

  readonly columns = computed(() =>
    createTicketColumns({
      onReprintReceipt: (ticket) => this.openReceipt(ticket),
      onSelectTicket: (ticket) => this.openDetail(ticket),
      showParkingLot: this.isTenantView(),
    })
  );

  readonly table = this.tableState.createTable({
    columns: () => this.columns(),
    data: () => this.tickets(),
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) {
        return true;
      }
      const search = filterValue.trim().toUpperCase();
      const plate = row.original.licensePlate?.toUpperCase() ?? "";
      const parkingLot = row.original.parkingLotName?.toUpperCase() ?? "";
      const barcode = row.original.barcode?.toUpperCase() ?? "";
      return (
        plate.includes(search) ||
        parkingLot.includes(search) ||
        barcode.includes(search)
      );
    },
    initialVisibility: {
      parkingLotId: false,
    },
  });

  readonly filteredTickets = computed(() =>
    this.table.getFilteredRowModel().rows.map((row) => row.original)
  );

  readonly ticketStats = computed(() => {
    const all = this.tickets();
    const open = all.filter((t) => t.status === "OPEN").length;
    const closed = all.filter((t) => t.status === "CLOSED").length;
    return { closed, open, total: all.length };
  });

  loadTickets(parkingId?: string | null): void {
    this.parkingId.set(parkingId ?? null);
    this.isLoading.set(true);

    const request$ = parkingId
      ? this.ticketService.listTicketsByParkingLot(parkingId)
      : this.ticketService.listTicketsByTenant();

    request$.subscribe({
      error: () => {
        this.tickets.set([]);
        this.isLoading.set(false);
      },
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
    });
  }

  updateFilters(criteria: Partial<TicketFilterCriteria>): void {
    this.filters.update((current) => ({
      ...current,
      ...criteria,
    }));

    if (criteria.plate !== undefined) {
      this.tableState.setGlobalFilter(criteria.plate);
    }
    if (criteria.status !== undefined) {
      this.tableState.setColumnFilter(
        "status",
        criteria.status === "ALL" ? undefined : criteria.status
      );
    }
    if (criteria.vehicleType !== undefined) {
      this.tableState.setColumnFilter(
        "slotType",
        criteria.vehicleType === "ALL" ? undefined : criteria.vehicleType
      );
    }
    if (criteria.parkingLotId !== undefined) {
      this.tableState.setColumnFilter(
        "parkingLotId",
        criteria.parkingLotId === "ALL" ? undefined : criteria.parkingLotId
      );
    }
    if (criteria.dateRange !== undefined) {
      this.tableState.setColumnFilter("entryTime", criteria.dateRange);
    }
  }

  resetFilters(): void {
    this.filters.set(INITIAL_TICKET_FILTERS);
    this.tableState.resetFilters();
  }

  openDetail(ticket: TicketSummary): void {
    this.selectedTicket.set(ticket);
    this.isDrawerOpen.set(true);

    if (ticket.status === "OPEN") {
      this.isCalculatingRate.set(true);
      this.liveRatePreview.set(null);

      this.ticketService.calculatePrice(ticket.id).subscribe({
        error: () => {
          this.liveRatePreview.set(null);
          this.isCalculatingRate.set(false);
        },
        next: (rate) => {
          this.liveRatePreview.set(rate);
          this.isCalculatingRate.set(false);
        },
      });
    } else {
      this.liveRatePreview.set(null);
      this.isCalculatingRate.set(false);
    }
  }

  closeDetail(): void {
    this.isDrawerOpen.set(false);
    this.selectedTicket.set(null);
    this.liveRatePreview.set(null);
    this.isCalculatingRate.set(false);
  }

  openReceipt(ticket: TicketSummary): void {
    this.selectedTicket.set(ticket);
    this.isReceiptOpen.set(true);
  }

  closeReceipt(): void {
    this.isReceiptOpen.set(false);
  }
}
