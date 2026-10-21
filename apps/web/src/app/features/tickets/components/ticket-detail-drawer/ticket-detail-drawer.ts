import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
} from "@angular/core";
import type { PriceDetailedModel, TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCar,
  lucideClock,
  lucideCreditCard,
  lucideLayers,
  lucidePrinter,
  lucideShieldCheck,
  lucideX,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DecimalPipe,
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    TypographyH3,
    TypographyH4,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucideClock,
      lucideCreditCard,
      lucideLayers,
      lucidePrinter,
      lucideShieldCheck,
      lucideX,
    }),
  ],
  selector: "app-ticket-detail-drawer",
  standalone: true,
  templateUrl: "./ticket-detail-drawer.html",
})
export class TicketDetailDrawerComponent {
  readonly texts = APP_TEXTS.tickets.detail;
  readonly actionTexts = APP_TEXTS.tickets.actions;

  readonly isOpen = input.required<boolean>();
  readonly ticket = input<TicketSummary | null>(null);
  readonly liveRate = input<PriceDetailedModel | null>(null);
  readonly isLoadingRate = input<boolean>(false);

  readonly close = output();
  readonly reprintReceipt = output<TicketSummary>();

  @HostListener("document:keydown.escape", ["$event"])
  onEscape(event: Event): void {
    if (this.isOpen()) {
      event.preventDefault();
      this.close.emit();
    }
  }

  readonly elapsedDuration = computed(() => {
    const t = this.ticket();
    if (!t?.entryTime) {
      return "---";
    }
    const start = new Date(t.entryTime).getTime();
    const end = t.exitTime ? new Date(t.exitTime).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);
    const diffMins = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours} h ${mins} min`;
  });

  static formatDate(dateStr?: string): string {
    if (!dateStr) {
      return "---";
    }
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  readonly formatDate = TicketDetailDrawerComponent.formatDate;
}
