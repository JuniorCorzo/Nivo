import type { TicketSummary } from "@core/models/ticket.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { ColumnDef } from "@tanstack/angular-table";
import { createColumnHelper, flexRenderComponent } from "@tanstack/angular-table";

import { TicketParkingBadgeComponent } from "./ticket-parking-badge";
import { TicketPlateCellComponent } from "./ticket-plate-cell";
import { TicketRowActionsComponent } from "./ticket-row-actions";
import { TicketStatusBadgeComponent } from "./ticket-status-badge";
import { TicketVehicleBadgeComponent } from "./ticket-vehicle-badge";

export const formatTicketDate = (dateStr?: string): string => {
  if (!dateStr) {
    return APP_TEXTS.tickets.table.emptyFallback;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return dateStr;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatTicketCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null) {
    return APP_TEXTS.tickets.table.emptyFallback;
  }
  return `$${new Intl.NumberFormat("en-US").format(amount)}`;
};

interface DateRangeFilter {
  from?: string;
  to?: string;
}

const isDateRangeFilter = (value: unknown): value is DateRangeFilter =>
  value instanceof Object && !Array.isArray(value);

export interface TicketColumnsOptions {
  onReprintReceipt?: (ticket: TicketSummary) => void;
  onSelectTicket?: (ticket: TicketSummary) => void;
  showParkingLot?: boolean;
}

const columnHelper = createColumnHelper<TicketSummary>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TicketTableColumn = ColumnDef<TicketSummary, any>;

export const createTicketColumns = (options: TicketColumnsOptions = {}): TicketTableColumn[] => {
  const columns: TicketTableColumn[] = [
    columnHelper.accessor("licensePlate", {
      cell: (info) =>
        flexRenderComponent(TicketPlateCellComponent, {
          inputs: { plate: info.getValue() },
        }),
      enableSorting: true,
      filterFn: (row, columnId, filterValue: string) =>
        !filterValue ||
        String(row.getValue(columnId)).toUpperCase().includes(filterValue.trim().toUpperCase()),
      header: APP_TEXTS.tickets.table.columns.plate,
      id: "licensePlate",
    }),
  ];

  if (options.showParkingLot) {
    columns.push(
      columnHelper.accessor("parkingLotName", {
        cell: (info) =>
          flexRenderComponent(TicketParkingBadgeComponent, {
            inputs: { name: info.getValue() },
          }),
        enableSorting: true,
        header: APP_TEXTS.tickets.table.columns.parkingLot,
        id: "parkingLotName",
      }),
    );
  }

  columns.push(
    columnHelper.accessor("slotType", {
      cell: (info) =>
        flexRenderComponent(TicketVehicleBadgeComponent, {
          inputs: { slotType: info.getValue() },
        }),
      enableSorting: true,
      filterFn: (row, columnId, filterValue: string) =>
        !filterValue || filterValue === "ALL" || row.getValue(columnId) === filterValue,
      header: APP_TEXTS.tickets.table.columns.vehicleType,
      id: "slotType",
    }),
    columnHelper.accessor("entryTime", {
      cell: (info) => formatTicketDate(info.getValue()),
      enableSorting: true,
      filterFn: (row, columnId, filterValue: unknown) => {
        if (!isDateRangeFilter(filterValue)) {
          return true;
        }
        /* SAFETY: isDateRangeFilter validates value is a date range object */
        const range = filterValue as DateRangeFilter;
        if (!range.from && !range.to) {
          return true;
        }
        /* SAFETY: entryTime in TicketSummary is an ISO date string or undefined */
        const val = row.getValue(columnId) as string | undefined;
        const ticketDate = val ? new Date(val).getTime() : 0;
        if (range.from) {
          const fromTime = new Date(range.from).getTime();
          if (ticketDate < fromTime) {
            return false;
          }
        }
        if (range.to) {
          const toTime = new Date(range.to).getTime();
          if (ticketDate > toTime) {
            return false;
          }
        }
        return true;
      },
      header: APP_TEXTS.tickets.table.columns.entryTime,
      id: "entryTime",
    }),
    columnHelper.accessor("status", {
      cell: (info) =>
        flexRenderComponent(TicketStatusBadgeComponent, {
          inputs: { status: info.getValue() },
        }),
      enableSorting: true,
      filterFn: (row, columnId, filterValue: string) =>
        !filterValue || filterValue === "ALL" || row.getValue(columnId) === filterValue,
      header: APP_TEXTS.tickets.table.columns.status,
      id: "status",
    }),
    columnHelper.accessor("totalToCharge", {
      cell: (info) => formatTicketCurrency(info.getValue()),
      enableSorting: true,
      header: APP_TEXTS.tickets.table.columns.total,
      id: "totalToCharge",
    }),
    columnHelper.display({
      cell: (info) =>
        flexRenderComponent(TicketRowActionsComponent, {
          inputs: { ticket: info.row.original },
          outputs: {
            reprintReceipt: (ticket) => options.onReprintReceipt?.(ticket),
            selectTicket: (ticket) => options.onSelectTicket?.(ticket),
          },
        }),
      enableSorting: false,
      header: APP_TEXTS.tickets.table.columns.actions,
      id: "actions",
    }),
    // Hidden column for parkingLotId filtering
    columnHelper.accessor("parkingLotId", {
      enableHiding: true,
      filterFn: (row, columnId, filterValue: string) =>
        !filterValue || filterValue === "ALL" || row.getValue(columnId) === filterValue,
      header: "Parking Lot ID",
      id: "parkingLotId",
    }),
  );

  return columns;
};
