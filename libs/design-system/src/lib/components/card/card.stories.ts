import type { Meta, StoryObj } from "@storybook/angular";
import { Component } from "@angular/core";
import { CardComponent } from "./card";
import { CardHeaderComponent } from "./card-header";
import { CardTitleComponent } from "./card-title";
import { CardDescriptionComponent } from "./card-description";
import { CardContentComponent } from "./card-content";
import { CardFooterComponent } from "./card-footer";
import { ButtonComponent } from "../button/button";
import { BadgeComponent } from "../badge/badge";
import { InputComponent } from "../input/input";

const ALL_CARD_IMPORTS = [
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
  InputComponent,
  BadgeComponent,
  ButtonComponent,
];

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Components/Card",
  tags: ["autodocs"],
};

export default meta;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Simple: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_CARD_IMPORTS },
    template: `
      <div class="p-6">
        <nv-card class="w-[380px]">
          <nv-card-header>
            <nv-card-title>Bienvenido a Nivo</nv-card-title>
            <nv-card-description>
              Gestiona tus servicios financieros desde un solo lugar.
            </nv-card-description>
          </nv-card-header>
          <nv-card-content>
            <p class="text-sm text-[var(--foreground)]">
              Accede a tus cuentas, realiza transferencias y consulta tu historial
              de transacciones de forma rápida y segura.
            </p>
          </nv-card-content>
          <nv-input type="password" placeholder="Buscar..." />
        </nv-card>
      </div>
    `,
  }),
};

export const WithBadgeAndActions: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_CARD_IMPORTS },
    template: `
      <div class="p-6">
        <nv-card class="w-[380px]">
          <nv-card-header>
            <div class="flex items-center justify-between">
              <nv-card-title>Cuenta de Ahorros</nv-card-title>
              <nv-badge variant="success">Activa</nv-badge>
            </div>
            <nv-card-description>****  ****  ****  4821</nv-card-description>
          </nv-card-header>
          <nv-card-content>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-[var(--muted-foreground)]">Saldo disponible</span>
              <span class="text-3xl font-bold font-sans text-[var(--foreground)]">$12,450.00</span>
            </div>
          </nv-card-content>
          <nv-card-footer class="gap-2">
            <nv-button size="sm">Transferir</nv-button>
            <nv-button variant="outline" size="sm">Ver movimientos</nv-button>
          </nv-card-footer>
        </nv-card>
      </div>
    `,
  }),
};

export const StatsGrid: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_CARD_IMPORTS },
    template: `
      <div class="p-6">
        <div class="grid grid-cols-3 gap-4 w-[760px]">
          <nv-card>
            <nv-card-header>
              <nv-card-description>Ingresos del mes</nv-card-description>
              <nv-card-title>$8,240.00</nv-card-title>
            </nv-card-header>
            <nv-card-content>
              <nv-badge variant="success">+12.5%</nv-badge>
              <span class="text-xs text-[var(--muted-foreground)] ml-1">vs mes anterior</span>
            </nv-card-content>
          </nv-card>

          <nv-card>
            <nv-card-header>
              <nv-card-description>Gastos del mes</nv-card-description>
              <nv-card-title>$3,180.00</nv-card-title>
            </nv-card-header>
            <nv-card-content>
              <nv-badge variant="destructive">+4.2%</nv-badge>
              <span class="text-xs text-[var(--muted-foreground)] ml-1">vs mes anterior</span>
            </nv-card-content>
          </nv-card>

          <nv-card>
            <nv-card-header>
              <nv-card-description>Ahorro neto</nv-card-description>
              <nv-card-title>$5,060.00</nv-card-title>
            </nv-card-header>
            <nv-card-content>
              <nv-badge variant="info">61.4%</nv-badge>
              <span class="text-xs text-[var(--muted-foreground)] ml-1">tasa de ahorro</span>
            </nv-card-content>
          </nv-card>
        </div>
      </div>
    `,
  }),
};

export const Notifications: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: ALL_CARD_IMPORTS },
    template: `
      <div class="p-6">
        <div class="flex flex-col gap-3 w-[380px]">
          <nv-card>
            <nv-card-header>
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1">
                  <nv-card-title>Transferencia recibida</nv-card-title>
                  <nv-card-description>Hace 5 minutos</nv-card-description>
                </div>
                <nv-badge variant="success">+$500.00</nv-badge>
              </div>
            </nv-card-header>
            <nv-card-content>
              <p class="text-sm text-[var(--foreground)]">
                Has recibido una transferencia de <strong>Carlos Mendez</strong>.
              </p>
            </nv-card-content>
            <nv-card-footer>
              <nv-button variant="outline" size="sm">Ver detalle</nv-button>
            </nv-card-footer>
          </nv-card>

          <nv-card>
            <nv-card-header>
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-1">
                  <nv-card-title>Pago procesado</nv-card-title>
                  <nv-card-description>Ayer, 10:30 AM</nv-card-description>
                </div>
                <nv-badge variant="warning">-$120.00</nv-badge>
              </div>
            </nv-card-header>
            <nv-card-content>
              <p class="text-sm text-[var(--foreground)]">
                Pago de factura <strong>Servicio de Internet</strong> realizado exitosamente.
              </p>
            </nv-card-content>
            <nv-card-footer>
              <nv-button variant="outline" size="sm">Ver detalle</nv-button>
            </nv-card-footer>
          </nv-card>
        </div>
      </div>
    `,
  }),
};
