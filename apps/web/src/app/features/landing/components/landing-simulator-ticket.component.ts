import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { SimulateRateResponse } from "@core/api/generated/models";
import type { VehicleType } from "@core/type/vehicle-type.type";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideReceipt,
  lucideShieldCheck,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgIcon,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideReceipt,
      lucideShieldCheck,
    }),
  ],
  selector: "landing-simulator-ticket",
  standalone: true,
  template: `
    <nv-card
      class="border-border bg-card relative border-2 p-6 shadow-md sm:p-8"
    >
      <div
        class="flex items-center justify-between border-b border-dashed border-[var(--border)] pb-4"
      >
        <div class="flex items-center gap-2">
          <ng-icon
            name="lucideReceipt"
            size="20"
            class="text-[var(--foreground)]"
          />
          <span class="font-mono text-sm font-bold tracking-wider uppercase">
            {{ texts.ticketTitle }}
          </span>
        </div>
        <nv-badge
          variant="success"
          class="flex items-center gap-1.5 px-2.5 py-0.5"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
            ></span>
          </span>
          <span>{{ texts.ticketBadge }}</span>
        </nv-badge>
      </div>

      <!-- Ticket Body -->
      <div class="space-y-4 pt-6">
        <div class="pb-2 text-center">
          <div class="text-lg font-bold text-[var(--foreground)]">
            {{ texts.demoFacilityName }}
          </div>
          <nv-muted class="text-xs">{{ texts.demoNit }}</nv-muted>
        </div>

        <div
          class="space-y-1.5 rounded bg-[var(--muted)]/50 p-3 font-mono text-xs"
        >
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">
              {{ texts.ticketVehicleLabel }}
            </span>
            <span class="font-semibold text-[var(--foreground)]">
              {{ vehicleType() }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">
              {{ texts.ticketStayLabel }}
            </span>
            <span class="font-semibold text-[var(--foreground)]">
              {{ minutesStayed() }} {{ texts.min }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">
              {{ texts.ticketDeliveryLabel }}
            </span>
            <span class="font-semibold text-emerald-500">
              {{ texts.ticketDeliveryValue }}
            </span>
          </div>
        </div>

        <!-- Lines Breakdowns -->
        @if (simulationResult(); as res) {
          <div
            class="space-y-2 border-y border-dashed border-[var(--border)] py-2"
          >
            @for (line of res.breakpoints; track line.concept) {
              <div class="flex justify-between text-xs">
                <span class="pr-2 text-[var(--muted-foreground)]">
                  {{ line.concept }}
                </span>
                <span
                  class="shrink-0 font-mono font-medium text-[var(--foreground)]"
                >
                  $ {{ line.amount | number: "1.0-0" }}
                </span>
              </div>
            }
          </div>

          <!-- Totals -->
          <div class="space-y-1.5 pt-2 text-xs">
            <div class="flex justify-between text-[var(--muted-foreground)]">
              <span>{{ texts.subtotalLabel }}</span>
              <span class="font-mono text-[var(--foreground)]">
                $ {{ res.subtotal | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
            <div class="flex justify-between text-[var(--muted-foreground)]">
              <span>
                {{
                  texts.ivaLabel((res.ivaRate * 100 | number: "1.0-0") ?? "0")
                }}
              </span>
              <span class="font-mono text-[var(--foreground)]">
                $ {{ res.ivaAmount | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
            <div
              class="flex items-baseline justify-between border-t border-[var(--border)] pt-2 text-base font-bold"
            >
              <span class="text-[var(--foreground)]">
                {{ texts.totalToPay }}
              </span>
              <span class="font-mono text-2xl font-bold text-emerald-400">
                $ {{ res.total | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
          </div>
        } @else {
          <div class="py-6 text-center text-sm text-[var(--muted-foreground)]">
            {{ texts.calculating }}
          </div>
        }

        <!-- Security notice -->
        <div class="pt-4 text-center">
          <div
            class="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
          >
            <ng-icon
              name="lucideShieldCheck"
              size="14"
              class="text-emerald-500"
            />
            <span>{{ texts.securityNotice }}</span>
          </div>
        </div>

        <div class="pt-4">
          <nv-button
            class="w-full"
            variant="default"
            (click)="registerClick.emit()"
          >
            <span>{{ texts.ctaButton }}</span>
            <ng-icon name="lucideArrowRight" size="16" />
          </nv-button>
        </div>
      </div>
    </nv-card>
  `,
})
export class LandingSimulatorTicketComponent {
  protected readonly texts = APP_TEXTS.landing.simulator;

  readonly vehicleType = input.required<VehicleType>();
  readonly minutesStayed = input.required<number>();
  readonly simulationResult = input<SimulateRateResponse | null>(null);

  readonly registerClick = output<void>();
}
