import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RateCalculationSimulation } from '@core/models/rate.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideClock, lucideCoins, lucideReceipt } from '@ng-icons/lucide';

@Component({
  selector: 'app-rate-preview',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSparkles, lucideClock, lucideCoins, lucideReceipt })],
  template: `
    <div class="rounded-2xl bg-card text-card-foreground border border-border p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div class="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div class="flex items-center gap-2 min-w-0">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <ng-icon name="lucideReceipt" class="text-sm" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-bold text-foreground truncate">Simulación en vivo</h4>
            <p class="text-[11px] text-muted-foreground">Estimación con parámetros actuales</p>
          </div>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-md bg-success/10 text-success border border-success/20 px-2 py-0.5 text-[11px] font-semibold shrink-0">
          <span class="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
          <span>En vivo</span>
        </span>
      </div>

      @if (simulation(); as sim) {
        <div class="flex flex-col gap-3 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border">
            <span class="text-muted-foreground font-medium">Duración calculada:</span>
            <span class="font-semibold text-foreground">
              {{ sim.durationInMinutes }} min ({{ sim.unitsCalculated }} {{ sim.timeUnit | lowercase }})
            </span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border">
            <span class="text-muted-foreground font-medium">Precio base:</span>
            <span class="font-mono font-bold text-foreground">
              {{ sim.basePrice | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border">
            <span class="text-muted-foreground font-medium">Subtotal:</span>
            <span class="font-mono font-bold text-foreground">
              {{ sim.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          </div>

          @if (sim.discountOrSurcharge !== 0) {
            <div
              class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold"
              [class.border-success/20]="sim.discountOrSurcharge < 0"
              [class.bg-success/10]="sim.discountOrSurcharge < 0"
              [class.text-success]="sim.discountOrSurcharge < 0"
              [class.border-warning/20]="sim.discountOrSurcharge > 0"
              [class.bg-warning/10]="sim.discountOrSurcharge > 0"
              [class.text-warning]="sim.discountOrSurcharge > 0"
            >
              <span>{{ sim.discountOrSurcharge < 0 ? 'Descuento aplicado:' : 'Recargo aplicado:' }}</span>
              <span class="font-mono">
                {{ sim.discountOrSurcharge | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
          }

          <div class="border-t border-border pt-3 mt-1">
            <div class="flex items-baseline justify-between">
              <span class="text-sm font-bold text-foreground">Total estimado:</span>
              <span class="text-2xl font-bold font-mono text-primary tracking-tight">
                {{ sim.total | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RatePreviewComponent {
  readonly simulation = input.required<RateCalculationSimulation>();
}

