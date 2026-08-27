import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BadgeComponent,
  CardComponent,
  TypographyH4,
  TypographyMono,
  TypographyMuted,
} from '@nivo-sass/design-system';
import { RateCalculationSimulation } from '@core/models/rate.model';

@Component({
  selector: 'app-rate-preview',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    BadgeComponent,
    TypographyH4,
    TypographyMuted,
    TypographyMono,
  ],
  template: `
    <nv-card class="p-4 sm:p-6 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div class="min-w-0 flex-1">
          <nv-h4 class="truncate">Simulación en vivo</nv-h4>
          <nv-muted class="text-xs">Estimación con parámetros actuales</nv-muted>
        </div>
        <nv-badge variant="info" class="shrink-0">En vivo</nv-badge>
      </div>

      @if (simulation(); as sim) {
        <div class="flex flex-col gap-3 text-sm">
          <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>Duración calculada:</span>
            <span class="font-medium text-foreground text-right">
              {{ sim.durationInMinutes }} min ({{ sim.unitsCalculated }} {{ sim.timeUnit | lowercase }})
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>Precio base:</span>
            <nv-mono class="font-medium text-foreground text-right">
              {{ sim.basePrice | currency:'COP':'symbol-narrow':'1.0-0' }}
            </nv-mono>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>Subtotal:</span>
            <nv-mono class="font-medium text-foreground text-right">
              {{ sim.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
            </nv-mono>
          </div>

          @if (sim.discountOrSurcharge !== 0) {
            <div
              class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs sm:text-sm font-medium"
              [class.text-emerald-600]="sim.discountOrSurcharge < 0"
              [class.text-amber-600]="sim.discountOrSurcharge > 0"
            >
              <span>{{ sim.discountOrSurcharge < 0 ? 'Descuento aplicado:' : 'Recargo aplicado:' }}</span>
              <nv-mono class="font-semibold text-right">
                {{ sim.discountOrSurcharge | currency:'COP':'symbol-narrow':'1.0-0' }}
              </nv-mono>
            </div>
          }

          <div class="border-t border-border pt-3 mt-1">
            <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
              <span class="text-sm sm:text-base font-semibold text-foreground">Total estimado:</span>
              <span class="text-xl sm:text-2xl font-bold font-mono text-primary tracking-tight text-right">
                {{ sim.total | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
          </div>
        </div>
      }
    </nv-card>
  `,
})
export class RatePreviewComponent {
  readonly simulation = input.required<RateCalculationSimulation>();
}
