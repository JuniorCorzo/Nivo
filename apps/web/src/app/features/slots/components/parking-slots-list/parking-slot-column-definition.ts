import type { SlotSummary } from "@core/models/slot.model";
import { createColumnHelper } from "@tanstack/angular-table";

const columnHelper = createColumnHelper<SlotSummary>();

export const parkingSlotColumnDefinition = () => [
  columnHelper.display({
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: "",
    id: "select",
    size: 44,
  }),
  columnHelper.accessor("slotNumber", {
    enableGlobalFilter: true,
    header: "Número",
    size: 100,
  }),
  columnHelper.accessor("prefix", {
    enableGlobalFilter: true,
    header: "Prefijo",
    size: 100,
  }),
  columnHelper.accessor("zone", {
    enableGlobalFilter: true,
    filterFn: "equalsString",
    header: "Zona",
    size: 120,
  }),
  columnHelper.accessor("type", {
    filterFn: "equalsString",
    header: "Tipo",
    size: 120,
  }),
  columnHelper.accessor("status", {
    filterFn: "equalsString",
    header: "Estado",
    size: 120,
  }),
  columnHelper.display({
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: "Acciones",
    id: "actions",
    size: 170,
  }),
];
