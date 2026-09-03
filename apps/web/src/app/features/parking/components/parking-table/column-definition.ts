import type { ParkingLotListItemModel } from "@core/models/parking.model";
import {
  createColumnHelper,
  flexRenderComponent,
} from "@tanstack/angular-table";

import { ActionsColumn } from "@/app/shared/components/actions-column/actions-column";

import { OccuppationMeter } from "../occuppation-meter/occuppation-meter";

export const parkingLotsColumnDefinition = () => {
  const columnHelper = createColumnHelper<ParkingLotListItemModel>();
  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Parqueadero",
      minSize: 180,
      size: 220,
    }),
    columnHelper.accessor("address", {
      cell: (info) => {
        const address = info.getValue();
        if (!address) {
          return "—";
        }
        const { street, city } = address;
        return [street, city].filter(Boolean).join(", ") || "—";
      },
      header: "Dirección",
      minSize: 220,
      size: 300,
    }),
    columnHelper.accessor("occuppationRate", {
      cell: (ctx) => {
        const total = ctx.row.original.totalCapacity ?? 0;
        const rate = ctx.row.original.occuppationRate ?? 0;
        const occupied = Math.round((total * rate) / 100);

        return flexRenderComponent(OccuppationMeter, {
          inputs: {
            max: "100",
            occupiedSlots: occupied,
            showDetails: true,
            totalCapacity: total,
            value: String(rate),
          },
        });
      },
      header: "Ocupación y Plazas",
      id: "occupancy",
      minSize: 200,
      size: 250,
    }),
    columnHelper.display({
      cell: (ctx) =>
        flexRenderComponent(ActionsColumn, {
          inputs: {
            parkingId: ctx.row.original.id,
          },
        }),
      header: "Acciones",
      id: "actions",
      minSize: 90,
      size: 110,
    }),
  ];

  return columns;
};
