import { ParkingLotListItemModel } from '@core/models/parking.model';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { OccuppationMeter } from '../occuppation-meter/occuppation-meter';
import { ActionsColumn } from '@/app/shared/components/actions-column/actions-column';

export const parkingLotsColumnDefinition = () => {
  const columnHelper = createColumnHelper<ParkingLotListItemModel>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Parqueadero',
      size: 220,
      minSize: 180,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('address', {
      header: 'Dirección',
      size: 300,
      minSize: 220,
      cell: (info) => {
        const address = info.getValue();
        if (!address) return '—';
        const { street, city } = address;
        return [street, city].filter(Boolean).join(', ') || '—';
      },
    }),
    columnHelper.accessor('occuppationRate', {
      id: 'occupancy',
      header: 'Ocupación y Plazas',
      size: 250,
      minSize: 200,
      cell: (ctx) => {
        const total = ctx.row.original.totalCapacity ?? 0;
        const rate = ctx.row.original.occuppationRate ?? 0;
        const occupied = Math.round((total * rate) / 100);

        return flexRenderComponent(OccuppationMeter, {
          inputs: {
            max: '100',
            value: String(rate),
            totalCapacity: total,
            occupiedSlots: occupied,
            showDetails: true,
          },
        });
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      size: 110,
      minSize: 90,
      cell: (ctx) =>
        flexRenderComponent(ActionsColumn, {
          inputs: {
            parkingId: ctx.row.original.id,
          },
        }),
    }),
  ];

  return columns;
};

