import { SlotSummary } from '@core/models/slot.model';
import { ColumnDef, createColumnHelper } from '@tanstack/angular-table';

const columnHelper = createColumnHelper<SlotSummary>();

export const parkingSlotColumnDefinition = (): ColumnDef<SlotSummary, any>[] => [
  columnHelper.display({
    id: 'select',
    header: '',
    size: 44,
    enableGlobalFilter: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('slotNumber', {
    header: 'Número',
    size: 100,
    enableGlobalFilter: true,
  }),
  columnHelper.accessor('prefix', {
    header: 'Prefijo',
    size: 100,
    enableGlobalFilter: true,
  }),
  columnHelper.accessor('zone', {
    header: 'Zona',
    size: 120,
    enableGlobalFilter: true,
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('type', {
    header: 'Tipo',
    size: 120,
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    size: 120,
    filterFn: 'equalsString',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acciones',
    size: 170,
    enableGlobalFilter: false,
    enableColumnFilter: false,
  }),
];
