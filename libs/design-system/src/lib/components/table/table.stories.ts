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
        <div class="relative w-full overflow-auto">
          <table nv-table>
            <thead nv-table-header class="w-full">
              <tr nv-table-row>
                <th nv-table-head>Factura</th>
                <th nv-table-head>Estado</th>
                <th nv-table-head>Fecha</th>
                <th nv-table-head class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody nv-table-body>
              <tr nv-table-row>
                <td nv-table-cell class="font-medium">INV-001</td>
                <td nv-table-cell>
                  <nv-badge variant="success">Pagada</nv-badge>
                </td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">2025-01-15</td>
                <td nv-table-cell class="text-right font-mono">$250.00</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-medium">INV-002</td>
                <td nv-table-cell>
                  <nv-badge variant="warning">Pendiente</nv-badge>
                </td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">2025-02-01</td>
                <td nv-table-cell class="text-right font-mono">$150.00</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-medium">INV-003</td>
                <td nv-table-cell>
                  <nv-badge variant="destructive">Vencida</nv-badge>
                </td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">2025-02-10</td>
                <td nv-table-cell class="text-right font-mono">$350.00</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-medium">INV-004</td>
                <td nv-table-cell>
                  <nv-badge variant="success">Pagada</nv-badge>
                </td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">2025-03-05</td>
                <td nv-table-cell class="text-right font-mono">$450.00</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-medium">INV-005</td>
                <td nv-table-cell>
                  <nv-badge variant="info">Procesando</nv-badge>
                </td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">2025-03-20</td>
                <td nv-table-cell class="text-right font-mono">$120.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  }),
};

export const ParkingSlots: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_TABLE_IMPORTS },
    template: `
      <div class="w-[700px] p-6">
        <div class="relative w-full overflow-auto">
          <table nv-table>
            <thead nv-table-header>
              <tr nv-table-row>
                <th nv-table-head>Plaza</th>
                <th nv-table-head>Vehículo</th>
                <th nv-table-head>Estado</th>
                <th nv-table-head class="text-right">Ingreso</th>
              </tr>
            </thead>
            <tbody nv-table-body>
              <tr nv-table-row>
                <td nv-table-cell class="font-mono font-medium">A-01</td>
                <td nv-table-cell class="font-mono">ABC-1234</td>
                <td nv-table-cell>
                  <nv-badge variant="destructive">Ocupada</nv-badge>
                </td>
                <td nv-table-cell class="text-right text-[var(--muted-foreground)]">08:30 AM</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-mono font-medium">A-02</td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">—</td>
                <td nv-table-cell>
                  <nv-badge variant="success">Disponible</nv-badge>
                </td>
                <td nv-table-cell class="text-right text-[var(--muted-foreground)]">—</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-mono font-medium">B-03</td>
                <td nv-table-cell class="font-mono">XYZ-5678</td>
                <td nv-table-cell>
                  <nv-badge variant="warning">Reservada</nv-badge>
                </td>
                <td nv-table-cell class="text-right text-[var(--muted-foreground)]">10:00 AM</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-mono font-medium">B-04</td>
                <td nv-table-cell class="font-mono">DEF-9012</td>
                <td nv-table-cell>
                  <nv-badge variant="destructive">Ocupada</nv-badge>
                </td>
                <td nv-table-cell class="text-right text-[var(--muted-foreground)]">09:15 AM</td>
              </tr>
              <tr nv-table-row>
                <td nv-table-cell class="font-mono font-medium">C-05</td>
                <td nv-table-cell class="text-[var(--muted-foreground)]">—</td>
                <td nv-table-cell>
                  <nv-badge variant="success">Disponible</nv-badge>
                </td>
                <td nv-table-cell class="text-right text-[var(--muted-foreground)]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  }),
};

export const EmptyState: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_TABLE_IMPORTS },
    template: `
      <div class="w-[600px] p-6">
        <div class="relative w-full overflow-auto">
          <table nv-table>
            <thead nv-table-header>
              <tr nv-table-row>
                <th nv-table-head>Documento</th>
                <th nv-table-head>Tipo</th>
                <th nv-table-head class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody nv-table-body>
              <tr nv-table-row>
                <td nv-table-cell colspan="3" class="h-24 text-center text-[var(--muted-foreground)]">
                  No hay transacciones registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
  }),
};
