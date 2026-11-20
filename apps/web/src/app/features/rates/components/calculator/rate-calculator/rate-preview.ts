import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { SimulateRateResult } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideLoader2,
  lucideReceipt,
  lucideSparkles,
} from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideLoader2,
      lucideReceipt,
      lucideSparkles,
    }),
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
              {{ texts.title }}
            </h4>
            <p class="text-muted-foreground text-[11px]">
              {{ texts.subtitle }}
            </p>
          </div>
        </div>

        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
          [class.bg-success/10]="!isLoading()"
          [class.text-success]="!isLoading()"
          [class.border-success/20]="!isLoading()"
          [class.bg-muted]="isLoading()"
          [class.text-muted-foreground]="isLoading()"
          [class.border-border]="isLoading()"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            [class.bg-success]="!isLoading()"
            [class.animate-pulse]="!isLoading()"
            [class.bg-muted-foreground]="isLoading()"
          ></span>
          <span>{{
            isLoading() ? texts.calculatingBadge : texts.liveBadge
          }}</span>
        </span>
      </div>

      @if (isLoading()) {
        <div
          class="bg-muted/40 border-border flex flex-col items-center justify-center gap-2 rounded-xl border p-8 text-center"
        >
          <ng-icon
            name="lucideLoader2"
            class="text-primary animate-spin text-2xl"
          />
          <p class="text-muted-foreground text-xs font-medium">
            {{ texts.loadingLabel }}
          </p>
        </div>
      } @else if (error(); as errorMessage) {
        <div
          role="alert"
          class="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-2.5 rounded-xl border p-4 text-xs"
        >
          <ng-icon name="lucideAlertCircle" class="mt-0.5 shrink-0 text-base" />
          <p class="font-medium">{{ errorMessage }}</p>
        </div>
      } @else if (simulation(); as sim) {
        <div class="flex flex-col gap-3 text-xs">
          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">
              {{ texts.appliedRateLabel }}
            </span>
            <span class="text-foreground font-semibold">
              {{ sim.name }}
            </span>
          </div>

          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">
              {{ texts.durationLabel }}
            </span>
            <span class="text-foreground font-semibold tabular-nums">
              {{ minutesStayed() }} {{ texts.minutesSuffix }}
            </span>
          </div>

          @if (sim.breakpoints.length > 0) {
            <div
              class="border-border flex flex-col gap-1.5 rounded-xl border p-3"
            >
              <span
                class="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase"
              >
                {{ texts.breakdownTitle }}
              </span>
              @for (line of sim.breakpoints; track $index) {
                <div class="flex items-center justify-between gap-2 text-xs">
                  <span class="text-foreground/90">{{ line.concept }}</span>
                  <span
                    class="text-foreground font-mono font-semibold tabular-nums"
                  >
                    {{
                      line.amount | currency: "COP" : "symbol-narrow" : "1.0-0"
                    }}
                  </span>
                </div>
              }
            </div>
          }

          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">
              {{ texts.subtotalLabel }}
            </span>
            <span class="text-foreground font-mono font-bold tabular-nums">
              {{ sim.subtotal | currency: "COP" : "symbol-narrow" : "1.0-0" }}
            </span>
          </div>

          <div
            class="bg-muted/50 border-border flex items-center justify-between rounded-xl border p-2.5"
          >
            <span class="text-muted-foreground font-medium">
              {{ texts.ivaLabel }} ({{ ivaPercent() }}%):
            </span>
            <span class="text-foreground font-mono font-bold tabular-nums">
              {{ sim.ivaAmount | currency: "COP" : "symbol-narrow" : "1.0-0" }}
            </span>
          </div>

          <div
            class="bg-primary/10 border-primary/20 flex items-center justify-between rounded-xl border p-3.5"
          >
            <span class="text-primary text-sm font-bold">
              {{ texts.totalLabel }}
            </span>
            <span
              class="text-primary font-mono text-lg font-extrabold tabular-nums"
            >
              {{ sim.total | currency: "COP" : "symbol-narrow" : "1.0-0" }}
            </span>
          </div>
        </div>
      } @else {
        <div
          class="bg-muted/30 border-border flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center"
        >
          <ng-icon
            name="lucideSparkles"
            class="text-muted-foreground text-xl"
          />
          <p class="text-foreground text-xs font-semibold">
            {{ texts.emptyTitle }}
          </p>
          <p class="text-muted-foreground text-[11px]">
            {{ texts.emptySubtitle }}
          </p>
        </div>
      }
    </div>
  `,
})
export class RatePreviewComponent {
  readonly simulation = input<SimulateRateResult | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly minutesStayed = input<number>(0);

  protected readonly texts = APP_TEXTS.rates.preview;

  readonly ivaPercent = computed(() => {
    const rate = this.simulation()?.ivaRate ?? 0;
    return Math.round(rate * 100);
  });
}
