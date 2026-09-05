import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import type { RateCalculationSimulation } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideSparkles,
  lucideClock,
  lucideCoins,
  lucideReceipt,
} from "@ng-icons/lucide";

@Component({
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({ lucideClock, lucideCoins, lucideReceipt, lucideSparkles }),
  ],
  selector: "app-rate-preview",
  standalone: true,
  template: `
    <div
      class="bg-card text-card-foreground border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-xs sm:p-6"
    >
      <div
        class="border-border flex items-center justify-between gap-2 border-b pb-3"
      >
        <div class="flex min-w-0 items-center gap-2">
          <div
            class="bg-primary/10 text-primary border-primary/20 flex h-7 w-7 items-center justify-center rounded-lg border"
          >
            <ng-icon name="lucideReceipt" class="text-sm" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-foreground truncate text-sm font-bold">
              Simulación en vivo
            </h4>
            <p class="text-muted-foreground text-[11px]">
              Estimación con parámetros actuales
            </p>
          </div>
        </div>
        <span
          class="bg-success/10 text-success border-success/20 inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
        >
          <span
            class="bg-success h-1.5 w-1.5 animate-pulse rounded-full"
          ></span>
          <span>En vivo</span>
        </span>
      </div>

      @if (simulation(); as sim) {
        <div class="flex flex-col gap-3 text-xs">
          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium"
              >Duración calculada:</span
            >
            <span class="text-foreground font-semibold">
              {{ sim.durationInMinutes }} min ({{ sim.unitsCalculated }}
              {{ sim.timeUnit | lowercase }})
            </span>
          </div>

          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">Precio base:</span>
            <span class="text-foreground font-mono font-bold">
              {{ sim.basePrice | currency: "COP" : "symbol-narrow" : "1.0-0" }}
            </span>
          </div>

          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">Subtotal:</span>
            <span class="text-foreground font-mono font-bold">
              {{ sim.subtotal | currency: "COP" : "symbol-narrow" : "1.0-0" }}
            </span>
          </div>

          @if (sim.discountOrSurcharge !== 0) {
            <div
              class="flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold"
              [class.border-success/20]="sim.discountOrSurcharge < 0"
              [class.bg-success/10]="sim.discountOrSurcharge < 0"
              [class.text-success]="sim.discountOrSurcharge < 0"
              [class.border-warning/20]="sim.discountOrSurcharge > 0"
              [class.bg-warning/10]="sim.discountOrSurcharge > 0"
              [class.text-warning]="sim.discountOrSurcharge > 0"
            >
              <span>{{
                sim.discountOrSurcharge < 0
                  ? "Descuento aplicado:"
                  : "Recargo aplicado:"
              }}</span>
              <span class="font-mono">
                {{
                  sim.discountOrSurcharge
                    | currency: "COP" : "symbol-narrow" : "1.0-0"
                }}
              </span>
            </div>
          }

          <div class="border-border mt-1 border-t pt-3">
            <div class="flex items-baseline justify-between">
              <span class="text-foreground text-sm font-bold"
                >Total estimado:</span
              >
              <span
                class="text-primary font-mono text-2xl font-bold tracking-tight"
              >
                {{ sim.total | currency: "COP" : "symbol-narrow" : "1.0-0" }}
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
