import { Component, effect, inject, input } from '@angular/core';
import { ParkingService } from '@core/services/parking-service';
import {
  createAngularTable,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/angular-table';
import { parkingLotsColumnDefinition } from './column-definition';
import {
  TableBodyComponent,
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from '@nivo-sass/design-system';

@Component({
  selector: 'app-parking-table',
  imports: [
    TableComponent,
    TableBodyComponent,
    TableHeaderComponent,
    TableRowComponent,
    TableCellComponent,
    TableHeadComponent,
    FlexRender,
  ],
  templateUrl: './parking-table.html',
})
export class ParkingTable {
  private readonly rightAlignedColumnIds = new Set(['totalCapacity']);
  private readonly truncateColumnIds = new Set(['name', 'address', 'ownerName']);

  readonly searchQuery = input<string>('');

  private parkingService = inject(ParkingService);
  protected table = createAngularTable(() => ({
    data: this.parkingService.parkingLots() ?? [],
    columns: parkingLotsColumnDefinition(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter: this.searchQuery(),
    },
  }));

  protected shouldRenderHeader(
    header: { isPlaceholder: boolean; column: { parent?: unknown } },
    headerGroupDepth: number,
  ): boolean {
    if (headerGroupDepth === 0) {
      return true;
    }

    return Boolean(header.column.parent) && !header.isPlaceholder;
  }

  protected rowSpanForHeader(header: { subHeaders: unknown[] }, headerGroupDepth: number): number {
    if (header.subHeaders.length > 1) {
      return 1;
    }

    return this.table.getHeaderGroups().length - headerGroupDepth;
  }

  protected headerRowClass(headerGroupDepth: number): string {
    const isLastHeaderRow = headerGroupDepth === this.table.getHeaderGroups().length - 1;

    return [!isLastHeaderRow ? '!border-b-0' : '', 'hover:!bg-transparent']
      .filter(Boolean)
      .join(' ');
  }

  protected headerCellClass(
    header: { column: { id: string }; subHeaders: unknown[] },
    headerGroupDepth: number,
  ): string {
    const classes = ['!align-bottom'];

    classes.push('pb-3');

    if (header.subHeaders.length > 1) {
      classes.push('flex justify-center align-bottom!');
    }

    return classes.join(' ');
  }

  protected contentClass(columnId: string): string {
    const classes: string[] = [];

    if (this.truncateColumnIds.has(columnId)) {
      classes.push('block', 'max-w-full', 'truncate');
    }

    if (this.rightAlignedColumnIds.has(columnId)) {
      classes.push('text-right', 'tabular-nums');
    }

    if (columnId === 'name') {
      classes.push('font-medium');
    }

    if (columnId === 'currency') {
      classes.push('font-mono', 'uppercase');
    }

    return classes.join(' ');
  }

  protected titleForCell(columnId: string, row: unknown): string | null {
    const parkingLot = row as Record<string, unknown>;

    switch (columnId) {
      case 'name':
      case 'ownerName':
      case 'currency':
        return String(parkingLot[columnId] ?? '');
      case 'address': {
        const address = parkingLot['address'] as
          | { street?: string; city?: string; state?: string }
          | undefined;

        if (!address) {
          return null;
        }

        return [address.street, address.city, address.state].filter(Boolean).join(', ');
      }
      case 'slotDistribution': {
        const distribution = parkingLot['slotDistribution'] as
          | Array<{ type: string; count: number }>
          | undefined;

        return distribution?.map((slot) => `${slot.type}: ${slot.count}`).join(' | ') ?? null;
      }
      case 'totalCapacity':
        return String(parkingLot['totalCapacity'] ?? '');
      default:
        return null;
    }
  }
}
