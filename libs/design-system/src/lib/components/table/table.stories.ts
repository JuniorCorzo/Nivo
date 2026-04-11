import type { Meta, StoryObj } from "@storybook/angular";
import { TableComponent } from "./table";
import { TableHeaderComponent } from "./table-header";
import { TableBodyComponent } from "./table-body";
import { TableRowComponent } from "./table-row";
import { TableHeadComponent } from "./table-head";
import { TableCellComponent } from "./table-cell";
import { BadgeComponent } from "../badge/badge";

const ALL_TABLE_IMPORTS = [
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent,
  BadgeComponent,
];

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Components/Table",
  tags: ["autodocs"],
};

export default meta;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const TransactionsTable: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_TABLE_IMPORTS },
    template: `
      <div class="w-[800px] p-6">
        <nv-table>
          <nv-table-header class="w-full">
            <nv-table-row>
              <nv-table-head>Factura</nv-table-head>
              <nv-table-head>Estado</nv-table-head>
              <nv-table-head>Fecha</nv-table-head>
              <nv-table-head class="text-right">Monto</nv-table-head>
            </nv-table-row>
          </nv-table-header>
          <nv-table-body>
            <nv-table-row>
              <nv-table-cell class="font-medium">INV-001</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="success">Pagada</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">2025-01-15</nv-table-cell>
              <nv-table-cell class="text-right font-mono">$250.00</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-medium">INV-002</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="warning">Pendiente</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">2025-02-01</nv-table-cell>
              <nv-table-cell class="text-right font-mono">$150.00</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-medium">INV-003</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="destructive">Vencida</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">2025-02-10</nv-table-cell>
              <nv-table-cell class="text-right font-mono">$350.00</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-medium">INV-004</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="success">Pagada</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">2025-03-05</nv-table-cell>
              <nv-table-cell class="text-right font-mono">$450.00</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-medium">INV-005</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="info">Procesando</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">2025-03-20</nv-table-cell>
              <nv-table-cell class="text-right font-mono">$120.00</nv-table-cell>
            </nv-table-row>
          </nv-table-body>
        </nv-table>
      </div>
    `,
  }),
};

export const ParkingSlots: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_TABLE_IMPORTS },
    template: `
      <div class="w-[700px] p-6">
        <nv-table>
          <nv-table-header>
            <nv-table-row>
              <nv-table-head>Plaza</nv-table-head>
              <nv-table-head>Vehículo</nv-table-head>
              <nv-table-head>Estado</nv-table-head>
              <nv-table-head class="text-right">Ingreso</nv-table-head>
            </nv-table-row>
          </nv-table-header>
          <nv-table-body>
            <nv-table-row>
              <nv-table-cell class="font-mono font-medium">A-01</nv-table-cell>
              <nv-table-cell class="font-mono">ABC-1234</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="destructive">Ocupada</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-right text-[var(--muted-foreground)]">08:30 AM</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-mono font-medium">A-02</nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">—</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="success">Disponible</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-right text-[var(--muted-foreground)]">—</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-mono font-medium">B-03</nv-table-cell>
              <nv-table-cell class="font-mono">XYZ-5678</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="warning">Reservada</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-right text-[var(--muted-foreground)]">10:00 AM</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-mono font-medium">B-04</nv-table-cell>
              <nv-table-cell class="font-mono">DEF-9012</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="destructive">Ocupada</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-right text-[var(--muted-foreground)]">09:15 AM</nv-table-cell>
            </nv-table-row>
            <nv-table-row>
              <nv-table-cell class="font-mono font-medium">C-05</nv-table-cell>
              <nv-table-cell class="text-[var(--muted-foreground)]">—</nv-table-cell>
              <nv-table-cell>
                <nv-badge variant="success">Disponible</nv-badge>
              </nv-table-cell>
              <nv-table-cell class="text-right text-[var(--muted-foreground)]">—</nv-table-cell>
            </nv-table-row>
          </nv-table-body>
        </nv-table>
      </div>
    `,
  }),
};

export const EmptyState: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_TABLE_IMPORTS },
    template: `
      <div class="w-[600px] p-6">
        <nv-table>
          <nv-table-header>
            <nv-table-row>
              <nv-table-head>Documento</nv-table-head>
              <nv-table-head>Tipo</nv-table-head>
              <nv-table-head class="text-right">Monto</nv-table-head>
            </nv-table-row>
          </nv-table-header>
          <nv-table-body>
            <nv-table-row>
              <nv-table-cell colspan="3" class="h-24 text-center text-[var(--muted-foreground)]">
                No hay transacciones registradas.
              </nv-table-cell>
            </nv-table-row>
          </nv-table-body>
        </nv-table>
      </div>
    `,
  }),
};
