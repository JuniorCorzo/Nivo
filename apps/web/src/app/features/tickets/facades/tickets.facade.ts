import { computed, inject, Injectable, signal } from "@angular/core";
import type {
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { TicketService } from "@core/services/ticket-service";
import { DataTableState } from "@shared/components/data-table";

import { createTicketColumns } from "../components/tickets-table/ticket-columns-definition";
import type {
  TicketFilterCriteria,
  TicketStatusFilter,
} from "../models/ticket-filter.model";
import { INITIAL_TICKET_FILTERS } from "../models/ticket-filter.model";

type TicketStatusFilterWithMora = TicketStatusFilter | "MORA";

export interface TicketFilterCriteriaWithMora extends Omit<
  TicketFilterCriteria,
  "status"
> {
  status: TicketStatusFilterWithMora;
}

export interface TicketStats {
  activeRevenue: number;
  carCount: number;
  closed: number;
  closedRevenue: number;
  moraCount: number;
  motoCount: number;
  open: number;
  total: number;
}

@Injectable()
export class TicketsFacade {
  private readonly ticketService = inject(TicketService);
  private readonly parkingService = inject(ParkingService);
  private readonly tableState = new DataTableState<TicketSummary>();

  readonly parkingLots = this.parkingService.parkingLots;
  readonly parkingId = signal<string | null>(null);
  readonly isTenantView = computed(() => !this.parkingId());
  readonly tickets = signal<TicketSummary[]>([]);
  readonly filters = signal<TicketFilterCriteriaWithMora>(
    INITIAL_TICKET_FILTERS
  );
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
      const normSearch = search.replaceAll(/[^A-Z0-9]/gu, "");
      const normPlate = plate.replaceAll(/[^A-Z0-9]/gu, "");
      const normBarcode = barcode.replaceAll(/[^A-Z0-9]/gu, "");
      return (
        plate.includes(search) ||
        parkingLot.includes(search) ||
        barcode.includes(search) ||
        (normSearch.length >= 2 &&
          (normPlate.includes(normSearch) || normBarcode.includes(normSearch)))
      );
    },
    initialVisibility: {
      parkingLotId: false,
    },
  });

  readonly filteredTickets = computed(() =>
    this.table.getFilteredRowModel().rows.map((row) => row.original)
  );

  readonly ticketStats = computed<TicketStats>(() => {
    const all = this.tickets();
    const now = Date.now();
    const eightHoursMs = 8 * 60 * 60 * 1000;

    let open = 0;
    let closed = 0;
    let moraCount = 0;
    let activeRevenue = 0;
    let closedRevenue = 0;
    let carCount = 0;
    let motoCount = 0;

    for (const t of all) {
      if (t.status === "OPEN") {
        open += 1;
        activeRevenue += t.totalToCharge ?? 0;
        if (t.entryTime) {
          const entryTimeMs = new Date(t.entryTime).getTime();
          if (!Number.isNaN(entryTimeMs) && now - entryTimeMs > eightHoursMs) {
            moraCount += 1;
          }
        }
      } else if (t.status === "CLOSED") {
        closed += 1;
        closedRevenue += t.totalToCharge ?? 0;
      }

      if (t.slotType === "CAR") {
        carCount += 1;
      } else if (t.slotType === "MOTORCYCLE") {
        motoCount += 1;
      }
    }

    return {
      activeRevenue,
      carCount,
      closed,
      closedRevenue,
      moraCount,
      motoCount,
      open,
      total: all.length,
    };
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

  updateFilters(criteria: Partial<TicketFilterCriteriaWithMora>): void {
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
