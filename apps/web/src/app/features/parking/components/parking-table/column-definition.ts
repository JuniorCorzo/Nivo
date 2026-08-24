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
      size: 340,
      minSize: 280,
      cell: (info) => {
        const { street, city, state } = info.getValue();
        return `${street}, ${city}, ${state}`;
      },
    }),
    columnHelper.accessor('totalCapacity', {
      header: 'Capacidad',
      size: 120,
      minSize: 110,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('occuppationRate', {
      header: 'Ocupación',
      cell: (ctx) =>
        flexRenderComponent(OccuppationMeter, {
          inputs: {
            max: '100',
            value: String(ctx.getValue()),
          },
        }),
    }),
    columnHelper.display({
      header: 'Acciones',
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
