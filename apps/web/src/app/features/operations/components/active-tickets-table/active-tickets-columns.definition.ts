import type { TicketSummary } from "@core/models/ticket.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { ColumnDef } from "@tanstack/angular-table";
import {
  createColumnHelper,
  flexRenderComponent,
} from "@tanstack/angular-table";

import { ActiveTicketActionCellComponent } from "./active-ticket-action-cell";
import { ActiveTicketEntryTimeCellComponent } from "./active-ticket-entry-time-cell";
import { ActiveTicketPlateCellComponent } from "./active-ticket-plate-cell";
import { ActiveTicketSlotCellComponent } from "./active-ticket-slot-cell";

export interface ActiveTicketColumnsOptions {
  onCheckOut: (ticket: TicketSummary) => void;
}

const columnHelper = createColumnHelper<TicketSummary>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActiveTicketTableColumn = ColumnDef<TicketSummary, any>;

export const createActiveTicketColumns = (
  options: ActiveTicketColumnsOptions
): ActiveTicketTableColumn[] => {
  const texts = APP_TEXTS.operations.activeTickets;

  return [
    columnHelper.accessor("licensePlate", {
      cell: (info) =>
        flexRenderComponent(ActiveTicketPlateCellComponent, {
          inputs: {
            licensePlate: info.getValue() ?? "",
            plateCountry: info.row.original.plateCountry,
          },
        }),
      enableSorting: false,
      header: texts.thPlate,
      id: "licensePlate",
      size: 160,
    }),
    columnHelper.accessor("slotNumber", {
      cell: (info) =>
        flexRenderComponent(ActiveTicketSlotCellComponent, {
          inputs: {
            slotNumber: info.getValue(),
            slotType: info.row.original.slotType,
          },
        }),
      enableSorting: false,
      header: texts.thSlot,
      id: "slotNumber",
      size: 130,
    }),
    columnHelper.accessor("entryTime", {
      cell: (info) =>
        flexRenderComponent(ActiveTicketEntryTimeCellComponent, {
          inputs: {
            entryTime: info.getValue(),
          },
        }),
      enableSorting: false,
      header: texts.thEntryTime,
      id: "entryTime",
      size: 120,
    }),
    columnHelper.display({
      cell: (info) =>
        flexRenderComponent(ActiveTicketActionCellComponent, {
          inputs: {
            ticket: info.row.original,
          },
          outputs: {
            checkOut: (ticket) => options.onCheckOut(ticket),
          },
        }),
      enableSorting: false,
      header: texts.thAction,
      id: "actions",
      size: 120,
    }),
  ];
};
