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
    <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div class="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div class="flex items-center gap-2 min-w-0">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
            <ng-icon name="lucideReceipt" class="text-sm" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-50 truncate">Simulación en vivo</h4>
            <p class="text-[11px] text-neutral-500 dark:text-neutral-400">Estimación con parámetros actuales</p>
          </div>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>En vivo</span>
        </span>
      </div>

      @if (simulation(); as sim) {
        <div class="flex flex-col gap-3 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <span class="text-neutral-500 dark:text-neutral-400 font-medium">Duración calculada:</span>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">
              {{ sim.durationInMinutes }} min ({{ sim.unitsCalculated }} {{ sim.timeUnit | lowercase }})
            </span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <span class="text-neutral-500 dark:text-neutral-400 font-medium">Precio base:</span>
            <span class="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {{ sim.basePrice | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          </div>

          <div class="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <span class="text-neutral-500 dark:text-neutral-400 font-medium">Subtotal:</span>
            <span class="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {{ sim.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          </div>

          @if (sim.discountOrSurcharge !== 0) {
            <div
              class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold"
              [class.border-emerald-200]="sim.discountOrSurcharge < 0"
              [class.bg-emerald-50/50]="sim.discountOrSurcharge < 0"
              [class.text-emerald-700]="sim.discountOrSurcharge < 0"
              [class.dark:border-emerald-900/50]="sim.discountOrSurcharge < 0"
              [class.dark:bg-emerald-950/20]="sim.discountOrSurcharge < 0"
              [class.dark:text-emerald-300]="sim.discountOrSurcharge < 0"
              [class.border-amber-200]="sim.discountOrSurcharge > 0"
              [class.bg-amber-50/50]="sim.discountOrSurcharge > 0"
              [class.text-amber-700]="sim.discountOrSurcharge > 0"
              [class.dark:border-amber-900/50]="sim.discountOrSurcharge > 0"
              [class.dark:bg-amber-950/20]="sim.discountOrSurcharge > 0"
              [class.dark:text-amber-300]="sim.discountOrSurcharge > 0"
            >
              <span>{{ sim.discountOrSurcharge < 0 ? 'Descuento aplicado:' : 'Recargo aplicado:' }}</span>
              <span class="font-mono">
                {{ sim.discountOrSurcharge | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
          }

          <div class="border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-1">
            <div class="flex items-baseline justify-between">
              <span class="text-sm font-bold text-neutral-900 dark:text-neutral-100">Total estimado:</span>
              <span class="text-2xl font-bold font-mono text-primary-600 dark:text-primary-400 tracking-tight">
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

