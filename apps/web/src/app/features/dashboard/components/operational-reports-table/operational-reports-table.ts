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
      cell: (info) => {
        const raw = String(info.getValue() || "");
        if (!raw) {
          return "-";
        }
        const shortId = raw.length > 8 ? raw.slice(0, 8) : raw;
        return `<span class="font-mono text-xs text-muted-foreground">#${shortId}</span>`;
      },
      header: "Ticket ID",
    },
    {
      accessorKey: "licensePlate",
      cell: (info) => {
        const val = info.getValue();
        if (!val || val === "-") {
          return `<span class="font-mono text-xs text-muted-foreground">-</span>`;
        }
        return `<span class="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-zinc-900 border border-zinc-800 text-foreground">${val}</span>`;
      },
      header: "Placa",
    },
    {
      accessorKey: "parkingName",
      cell: (info) =>
        `<span class="text-xs font-medium text-foreground">${info.getValue() || "-"}</span>`,
      header: "Sede",
      id: "parkingName",
    },
    {
      accessorKey: "slotNumber",
      cell: (info) =>
        `<span class="font-mono text-xs font-semibold text-foreground">${info.getValue() || "-"}</span>`,
      header: "Plaza",
    },
    {
      accessorKey: "slotType",
      cell: (info) =>
        `<span class="text-xs text-muted-foreground">${info.getValue() || "-"}</span>`,
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
        const timeStr = Number.isNaN(d.getTime())
          ? val
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `<span class="font-mono text-xs text-muted-foreground">${timeStr}</span>`;
      },
      header: "Entrada",
    },
    {
      accessorKey: "exitTime",
      cell: (info) => {
        const val = String(info.getValue() ?? "");
        if (!val) {
          return `<span class="text-xs text-muted-foreground">-</span>`;
        }
        const d = new Date(val);
        const timeStr = Number.isNaN(d.getTime())
          ? val
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return `<span class="font-mono text-xs text-muted-foreground">${timeStr}</span>`;
      },
      header: "Salida",
    },
    {
      accessorKey: "durationMinutes",
      cell: (info) => {
        const val = info.getValue();
        return val !== null && val !== undefined
          ? `<span class="font-mono text-xs text-foreground font-medium">${Math.round(Number(val))} min</span>`
          : `<span class="text-muted-foreground text-xs">-</span>`;
      },
      header: "Duración (min)",
    },
    {
      accessorKey: "ticketStatus",
      cell: (info) => {
        const status = String(info.getValue() || "");
        if (!status) {
          return "-";
        }
        const isCompleted =
          status === "COMPLETED" ||
          status === "CLOSED" ||
          status === "FINALIZADO";
        const isOpen =
          status === "OPEN" || status === "ACTIVE" || status === "ACTIVO";
        let badgeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (isOpen) {
          badgeClasses =
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        } else if (isCompleted) {
          badgeClasses = "bg-zinc-800 text-zinc-300 border-zinc-700";
        }
        return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${badgeClasses}">${status}</span>`;
      },
      header: "Estado",
    },
    {
      accessorKey: "totalToCharge",
      cell: (info) => {
        const val = info.getValue();
        const formatted =
          val === null || val === undefined
            ? "$0"
            : `$${Number(val).toLocaleString("es-CO")}`;
        return `<span class="font-mono font-semibold text-xs text-foreground">${formatted}</span>`;
      },
      header: "Total",
    },
    {
      accessorKey: "paymentStatus",
      cell: (info) => {
        const status = String(info.getValue() || "");
        if (!status) {
          return "-";
        }
        const isPaid = status === "PAID" || status === "PAGADO";
        const badgeClasses = isPaid
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20";
        return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${badgeClasses}">${status}</span>`;
      },
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
