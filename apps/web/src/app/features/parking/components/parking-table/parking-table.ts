import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ParkingService } from "@core/services/parking-service";
import {
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from "@nivo-sass/design-system";
import {
  createAngularTable,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/angular-table";

import { parkingLotsColumnDefinition } from "./column-definition";

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
  selector: "app-parking-table",
  templateUrl: "./parking-table.html",
})
export class ParkingTable {
  private readonly rightAlignedColumnIds = new Set<string>();
  private readonly truncateColumnIds = new Set([
    "name",
    "address",
    "ownerName",
  ]);

  readonly searchQuery = input<string>("");

  private parkingService = inject(ParkingService);
  protected table = createAngularTable(() => ({
    columns: parkingLotsColumnDefinition(),
    data: this.parkingService.parkingLots() ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter: this.searchQuery(),
    },
  }));

  protected static shouldRenderHeader(
    header: { isPlaceholder: boolean; column: { parent?: unknown } },
    headerGroupDepth: number
  ): boolean {
    if (headerGroupDepth === 0) {
      return true;
    }

    return Boolean(header.column.parent) && !header.isPlaceholder;
  }

  protected readonly shouldRenderHeader = ParkingTable.shouldRenderHeader;

  protected rowSpanForHeader(
    header: { subHeaders: unknown[] },
    headerGroupDepth: number
  ): number {
    if (header.subHeaders.length > 1) {
      return 1;
    }

    return this.table.getHeaderGroups().length - headerGroupDepth;
  }

  protected headerRowClass(headerGroupDepth: number): string {
    const isLastHeaderRow =
      headerGroupDepth === this.table.getHeaderGroups().length - 1;

    return [isLastHeaderRow ? "" : "!border-b-0", "hover:!bg-transparent"]
      .filter(Boolean)
      .join(" ");
  }

  protected static headerCellClass(
    header: { column: { id: string }; subHeaders: unknown[] },
    _headerGroupDepth: number
  ): string {
    const classes = ["!align-bottom"];

    classes.push("pb-3");

    if (header.subHeaders.length > 1) {
      classes.push("flex justify-center align-bottom!");
    }

    return classes.join(" ");
  }

  protected readonly headerCellClass = ParkingTable.headerCellClass;

  protected contentClass(columnId: string): string {
    const classes: string[] = [];

    if (this.truncateColumnIds.has(columnId)) {
      classes.push("block", "max-w-full", "truncate");
    }

    if (this.rightAlignedColumnIds.has(columnId)) {
      classes.push("text-right", "tabular-nums");
    }

    if (columnId === "name") {
      classes.push("font-medium");
    }

    if (columnId === "currency") {
      classes.push("font-mono", "uppercase");
    }

    return classes.join(" ");
  }

  protected static titleForCell(
    columnId: string,
    parkingLot: ParkingLotListItemModel
  ): string | null {
    switch (columnId) {
      case "name":
      case "ownerName":
      case "currency": {
        /* SAFETY: Accessing known string property by columnId */
        return String(
          parkingLot[columnId as keyof ParkingLotListItemModel] ?? ""
        );
      }
      case "address": {
        const { address } = parkingLot;
        if (!address) {
          return null;
        }

        return [address.street, address.city].filter(Boolean).join(", ");
      }
      case "slotDistribution": {
        const distribution = parkingLot.slotDistribution;
        return (
          distribution
            ?.map((slot) => `${slot.type}: ${slot.count}`)
            .join(" | ") ?? null
        );
      }
      case "occupancy":
      case "occuppationRate": {
        const capacity = Number(parkingLot.totalCapacity ?? 0);
        const rate = Number(parkingLot.occuppationRate ?? 0);
        const occupied = Math.round((capacity * rate) / 100);
        return `${occupied} / ${capacity} ocupados (${rate}%)`;
      }
      default: {
        return null;
      }
    }
  }

  protected readonly titleForCell = ParkingTable.titleForCell;
}
