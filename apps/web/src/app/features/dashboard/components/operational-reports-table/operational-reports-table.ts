import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from "@nivo-sass/design-system";
import {
  ColumnDef,
  createAngularTable,
  FlexRender,
  getCoreRowModel,
} from "@tanstack/angular-table";
import { OperationalReportItem } from "../../facade/dashboard.facade";

@Component({
  selector: "app-operational-reports-table",
  standalone: true,
  imports: [
    TableComponent,
    TableBodyComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableCellComponent,
    TableHeadComponent,
    FlexRender,
  ],
  templateUrl: "./operational-reports-table.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationalReportsTableComponent {
  readonly data = input<OperationalReportItem[]>([]);
  readonly isGlobalScope = input<boolean>(false);

  private readonly columns: ColumnDef<OperationalReportItem>[] = [
    {
      accessorKey: "ticketId",
      header: "Ticket ID",
      cell: (info) => String(info.getValue() || "").slice(0, 8),
    },
    {
      accessorKey: "licensePlate",
      header: "Placa",
      cell: (info) => info.getValue() || "-",
    },
    {
      id: "parkingName",
      accessorKey: "parkingName",
      header: "Sede",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "slotNumber",
      header: "Plaza",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "slotType",
      header: "Tipo",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "entryTime",
      header: "Entrada",
      cell: (info) => {
        const val = info.getValue() as string;
        if (!val) return "-";
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      },
    },
    {
      accessorKey: "exitTime",
      header: "Salida",
      cell: (info) => {
        const val = info.getValue() as string;
        if (!val) return "-";
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      },
    },
    {
      accessorKey: "durationMinutes",
      header: "Duración (min)",
      cell: (info) => info.getValue() ?? "-",
    },
    {
      accessorKey: "ticketStatus",
      header: "Estado",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "totalToCharge",
      header: "Total",
      cell: (info) => {
        const val = info.getValue();
        return val != null ? `$${Number(val).toLocaleString()}` : "$0";
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Estado Pago",
      cell: (info) => info.getValue() || "-",
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
