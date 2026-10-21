import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import { PublicTicketService } from "@core/services/public-ticket.service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCamera,
  lucideCheckCircle2,
  lucideClock,
  lucideCoins,
  lucideLoader2,
  lucideMapPin,
  lucideQrCode,
  lucideRefreshCw,
  lucideShare2,
} from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import QRCode from "qrcode";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCamera,
      lucideCheckCircle2,
      lucideClock,
      lucideCoins,
      lucideLoader2,
      lucideMapPin,
      lucideQrCode,
      lucideRefreshCw,
      lucideShare2,
    }),
  ],
  selector: "app-public-ticket-page",
  standalone: true,
  templateUrl: "./public-ticket-page.html",
})
export class PublicTicketPageComponent {
  readonly texts = APP_TEXTS.publicTicket;
  private readonly publicTicketService = inject(PublicTicketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string | null>(null);

  readonly ticket = signal<PublicTicketModel | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly hasError = signal<boolean>(false);
  readonly qrDataUrl = signal<string>("");
  readonly elapsedSeconds = signal<number>(0);

  private timerIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly formattedElapsed = computed<string>(() =>
    PublicTicketPageComponent.formatElapsed(this.elapsedSeconds()),
  );

  readonly estimatedCost = computed<number>(() => {
    const t = this.ticket();
    if (!t) {
      return 0;
    }
    if (t.totalToCharge !== undefined && t.totalToCharge !== null) {
      return t.totalToCharge;
    }
    const unitPrice = t.ratePricePerUnit ?? 2000;
    const timeUnit = t.rateTimeUnit ?? "HOURS";
    return PublicTicketPageComponent.calculateEstimatedFee(
      this.elapsedSeconds(),
      unitPrice,
      timeUnit,
    );
  });

  readonly whatsAppLink = computed<string>(() => {
    const t = this.ticket();
    if (!t) {
      return "";
    }
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://app.nivo.dev";
    const shareUrl = `${origin}/t/${t.id}`;
    const plate = t.plate || this.texts.unplatedVehicle;
    const message = encodeURIComponent(`Comprobante de parqueo vehículo ${plate}: ${shareUrl}`);
    return `https://wa.me/?text=${message}`;
  });

  constructor() {
    effect(() => {
      const ticketId = this.id();
      if (ticketId) {
        this.loadTicket(ticketId);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.stopTimer();
    });
  }

  loadTicket(id: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.publicTicketService.getPublicTicket(id).subscribe({
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.ticket.set(null);
        this.stopTimer();
      },
      next: (ticket) => {
        this.isLoading.set(false);
        this.hasError.set(false);
        this.ticket.set(ticket);
        this.generateQRCode(ticket.plate || ticket.id);
        this.startTimer(ticket.entryTime, ticket.exitTime);
      },
    });
  }

  refresh(): void {
    const ticketId = this.id();
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  private generateQRCode(text: string): void {
    QRCode.toString(text, {
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: 144,
    })
      .then((svg) => {
        this.qrDataUrl.set(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
      })
      .catch(() => {
        this.qrDataUrl.set("");
      });
  }

  private startTimer(entryTimeStr: string, exitTimeStr?: string): void {
    this.stopTimer();
    const entryDate = new Date(entryTimeStr).getTime();

    if (exitTimeStr) {
      const exitDate = new Date(exitTimeStr).getTime();
      const elapsed = Math.max(0, Math.floor((exitDate - entryDate) / 1000));
      this.elapsedSeconds.set(elapsed);
      return;
    }

    const calculateNow = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((now - entryDate) / 1000));
      this.elapsedSeconds.set(diffSeconds);
    };

    calculateNow();
    this.timerIntervalId = setInterval(calculateNow, 1000);
  }

  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  static formatElapsed(seconds: number): string {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  static calculateEstimatedFee(
    seconds: number,
    unitPrice: number,
    timeUnit: string = "HOURS",
  ): number {
    if (timeUnit === "MINUTES") {
      const minutesBilled = Math.max(1, Math.ceil(seconds / 60));
      return minutesBilled * unitPrice;
    }

    if (timeUnit === "DAYS") {
      const daysBilled = Math.max(1, Math.ceil(seconds / 86_400));
      return daysBilled * unitPrice;
    }

    // Default: HOURS (fraction of an hour counts as full hour)
    const hoursBilled = Math.max(1, Math.ceil(seconds / 3600));
    return hoursBilled * unitPrice;
  }
}
