import type { SlotSummary } from "@core/models/slot.model";
import {
  createColumnHelper,
  flexRenderComponent,
} from "@tanstack/angular-table";

import { SlotRowActionsComponent } from "../../components/table/slot-row-actions/slot-row-actions";
import { SlotStatusBadgeComponent } from "../../components/table/slot-status-badge/slot-status-badge";
import {
  SlotAccessibleCellComponent,
  SlotChargerCellComponent,
  SlotNumberCellComponent,
  SlotSelectCellComponent,
  SlotSelectHeaderComponent,
  SlotTypeCellComponent,
  SlotZoneCellComponent,
} from "../../components/table/slot-table-cells";

export interface ParkingSlotColumnOptions {
  allSelected?: () => boolean;
  onToggleAll?: (event: Event | boolean) => void;
  isSelected?: (id: string) => boolean;
  onToggleSelected?: (id: string, event: Event | boolean) => void;
  onChangeStatus?: (slot: SlotSummary) => void;
  onDelete?: (slot: SlotSummary) => void;
  onEdit?: (slot: SlotSummary) => void;
  onViewDetail?: (slot: SlotSummary) => void;
}

const columnHelper = createColumnHelper<SlotSummary>();

export const parkingSlotColumnDefinition = (
  options: ParkingSlotColumnOptions = {}
) => [
  columnHelper.display({
    cell: (info) =>
      flexRenderComponent(SlotSelectCellComponent, {
        inputs: {
          checked: options.isSelected
            ? options.isSelected(info.row.original.id)
            : false,
        },
        outputs: {
          toggle: (checked: boolean) =>
            options.onToggleSelected?.(info.row.original.id, checked),
        },
      }),
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: () =>
      flexRenderComponent(SlotSelectHeaderComponent, {
        inputs: {
          checked: options.allSelected ? options.allSelected() : false,
        },
        outputs: {
          toggle: (checked: boolean) => options.onToggleAll?.(checked),
        },
      }),
    id: "select",
    size: 44,
  }),
  columnHelper.accessor("slotNumber", {
    cell: (info) =>
      flexRenderComponent(SlotNumberCellComponent, {
        inputs: {
          isActive: info.row.original.isActive,
          slotNumber: info.getValue(),
        },
      }),
    enableGlobalFilter: true,
    header: "Número",
    size: 100,
  }),
  columnHelper.accessor("zone", {
    cell: (info) =>
      flexRenderComponent(SlotZoneCellComponent, {
        inputs: {
          zone: info.getValue(),
        },
      }),
    enableGlobalFilter: true,
    filterFn: "equalsString",
    header: "Zona",
    size: 120,
  }),
  columnHelper.accessor("type", {
    cell: (info) =>
      flexRenderComponent(SlotTypeCellComponent, {
        inputs: {
          type: info.getValue(),
        },
      }),
    filterFn: "equalsString",
    header: "Tipo Vehículo",
    size: 140,
  }),
  columnHelper.accessor("hasCharger", {
    cell: (info) =>
      flexRenderComponent(SlotChargerCellComponent, {
        inputs: {
          hasCharger: info.getValue(),
        },
      }),
    filterFn: "equals",
    header: "Tipo Slot",
    size: 120,
  }),
  columnHelper.accessor("isAccessible", {
    cell: (info) =>
      flexRenderComponent(SlotAccessibleCellComponent, {
        inputs: {
          isAccessible: info.getValue(),
        },
      }),
    filterFn: "equals",
    header: "Discapacitado / PMR",
    size: 150,
  }),
  columnHelper.accessor("status", {
    cell: (info) =>
      flexRenderComponent(SlotStatusBadgeComponent, {
        inputs: {
          isActive: info.row.original.isActive,
          status: info.getValue(),
        },
      }),
    filterFn: "equalsString",
    header: "Estado",
    size: 130,
  }),
  columnHelper.display({
    cell: (info) =>
      flexRenderComponent(SlotRowActionsComponent, {
        inputs: { slot: info.row.original },
        outputs: {
          changeStatus: options.onChangeStatus,
          delete: options.onDelete,
          edit: options.onEdit,
          viewDetail: options.onViewDetail,
        },
      }),
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: "Acciones",
    id: "actions",
    size: 140,
  }),
];
