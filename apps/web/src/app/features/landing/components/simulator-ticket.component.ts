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
  selector: "app-simulator-ticket",
  standalone: true,
  template: `
    <nv-card
      class="border-border bg-card relative border-2 p-6 shadow-md sm:p-8"
    >
      <div
        class="border-border flex items-center justify-between border-b border-dashed pb-4"
      >
        <div class="flex items-center gap-2">
          <ng-icon name="lucideReceipt" size="20" class="text-foreground" />
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
              class="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            ></span>
            <span
              class="bg-success relative inline-flex h-2 w-2 rounded-full"
            ></span>
          </span>
          <span>{{ texts.ticketBadge }}</span>
        </nv-badge>
      </div>

      <!-- Ticket Body -->
      <div class="space-y-4 pt-6">
        <div class="pb-2 text-center">
          <div class="text-foreground text-lg font-bold">
            {{ texts.demoFacilityName }}
          </div>
          <nv-muted class="text-xs">{{ texts.demoNit }}</nv-muted>
        </div>

        <div class="bg-muted/50 space-y-1.5 rounded-lg p-3 font-mono text-xs">
          <div class="flex justify-between">
            <span class="text-muted-foreground">
              {{ texts.ticketVehicleLabel }}
            </span>
            <span class="text-foreground font-semibold">
              {{ vehicleType() }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">
              {{ texts.ticketStayLabel }}
            </span>
            <span class="text-foreground font-semibold">
              {{ minutesStayed() }} {{ texts.min }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">
              {{ texts.ticketDeliveryLabel }}
            </span>
            <span class="text-success font-semibold">
              {{ texts.ticketDeliveryValue }}
            </span>
          </div>
        </div>

        <!-- Lines Breakdowns -->
        @if (simulationResult(); as res) {
          <div class="border-border space-y-2 border-y border-dashed py-2">
            @for (line of res.breakpoints; track line.concept) {
              <div class="flex justify-between text-xs">
                <span class="text-muted-foreground pr-2">
                  {{ line.concept }}
                </span>
                <span class="text-foreground shrink-0 font-mono font-medium">
                  $ {{ line.amount | number: "1.0-0" }}
                </span>
              </div>
            }
          </div>

          <!-- Totals -->
          <div class="space-y-1.5 pt-2 text-xs">
            <div class="text-muted-foreground flex justify-between">
              <span>{{ texts.subtotalLabel }}</span>
              <span class="text-foreground font-mono">
                $ {{ res.subtotal | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
            <div class="text-muted-foreground flex justify-between">
              <span>
                {{
                  texts.ivaLabel((res.ivaRate * 100 | number: "1.0-0") ?? "0")
                }}
              </span>
              <span class="text-foreground font-mono">
                $ {{ res.ivaAmount | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
            <div
              class="border-border flex items-baseline justify-between border-t pt-2 text-base font-bold"
            >
              <span class="text-foreground">
                {{ texts.totalToPay }}
              </span>
              <span class="text-success font-mono text-2xl font-bold">
                $ {{ res.total | number: "1.0-0" }} {{ texts.cop }}
              </span>
            </div>
          </div>
        } @else {
          <div class="text-muted-foreground py-6 text-center text-sm">
            {{ texts.calculating }}
          </div>
        }

        <!-- Security notice -->
        <div class="pt-4 text-center">
          <div
            class="text-muted-foreground inline-flex items-center gap-1.5 text-xs"
          >
            <ng-icon name="lucideShieldCheck" size="14" class="text-success" />
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
export class SimulatorTicketComponent {
  protected readonly texts = APP_TEXTS.landing.simulator;

  readonly vehicleType = input.required<VehicleType>();
  readonly minutesStayed = input.required<number>();
  readonly simulationResult = input<SimulateRateResponse | null>(null);

  readonly registerClick = output();
}

export { SimulatorTicketComponent as LandingSimulatorTicketComponent };
