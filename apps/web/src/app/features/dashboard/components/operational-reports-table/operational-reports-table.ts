import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationalReportItemModel as OperationalReportItem } from "@core/models/dashboard.model";
import {
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from "@nivo-sass/design-system";
import type { ColumnDef } from "@tanstack/angular-table";
import {
  createAngularTable,
  FlexRender,
  getCoreRowModel,
} from "@tanstack/angular-table";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableComponent,
    TableBodyComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableCellComponent,
    TableHeadComponent,
    FlexRender,
  ],
  selector: "app-operational-reports-table",
  standalone: true,
  templateUrl: "./operational-reports-table.html",
})
export class OperationalReportsTableComponent {
  readonly data = input<OperationalReportItem[]>([]);
  readonly isGlobalScope = input<boolean>(false);

  private readonly columns: ColumnDef<OperationalReportItem>[] = [
    {
      accessorKey: "ticketId",
      cell: (info) => String(info.getValue() || "").slice(0, 8),
      header: "Ticket ID",
    },
    {
      accessorKey: "licensePlate",
      cell: (info) => info.getValue() || "-",
      header: "Placa",
    },
    {
      accessorKey: "parkingName",
      cell: (info) => info.getValue() || "-",
      header: "Sede",
      id: "parkingName",
    },
    {
      accessorKey: "slotNumber",
      cell: (info) => info.getValue() || "-",
      header: "Plaza",
    },
    {
      accessorKey: "slotType",
      cell: (info) => info.getValue() || "-",
      header: "Tipo",
    },
    {
      accessorKey: "entryTime",
      cell: (info) => {
        const val = String(info.getValue() ?? "");
        if (!val) {
          return "-";
        }
        const d = new Date(val);
        return Number.isNaN(d.getTime())
          ? val
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      },
      header: "Entrada",
    },
    {
      accessorKey: "exitTime",
      cell: (info) => {
        const val = String(info.getValue() ?? "");
        if (!val) {
          return "-";
        }
        const d = new Date(val);
        return Number.isNaN(d.getTime())
          ? val
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      },
      header: "Salida",
    },
    {
      accessorKey: "durationMinutes",
      cell: (info) => info.getValue() ?? "-",
      header: "Duración (min)",
    },
    {
      accessorKey: "ticketStatus",
      cell: (info) => info.getValue() || "-",
      header: "Estado",
    },
    {
      accessorKey: "totalToCharge",
      cell: (info) => {
        const val = info.getValue();
        return val === null || val === undefined
          ? "$0"
          : `$${Number(val).toLocaleString()}`;
      },
      header: "Total",
    },
    {
      accessorKey: "paymentStatus",
      cell: (info) => info.getValue() || "-",
      header: "Estado Pago",
    },
  ];

  readonly table = createAngularTable(() => ({
    columns: this.columns,
    data: this.data() || [],
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility: {
        parkingName: this.isGlobalScope(),
      },
    },
  }));
}
