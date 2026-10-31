import { CommonModule, DecimalPipe } from "@angular/common";
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import type { PaymentRecord, TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCamera,
  lucideCheckCircle2,
  lucidePrinter,
  lucideQrCode,
  lucideShare2,
  lucideX,
} from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateFormatPipe } from "@shared/pipes/plate-format.pipe";
import QRCode from "qrcode";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, NgIcon, PlateFormatPipe],
  providers: [
    provideIcons({
      lucideCamera,
      lucideCheckCircle2,
      lucidePrinter,
      lucideQrCode,
      lucideShare2,
      lucideX,
    }),
  ],
  selector: "app-ticket-receipt",
  standalone: true,
  styleUrl: "./ticket-receipt.css",
  templateUrl: "./ticket-receipt.html",
})
export class TicketReceiptComponent {
  readonly texts = APP_TEXTS.ticketReceipt;

  readonly isOpen = input<boolean>(false);
  readonly ticket = input<TicketSummary | null>(null);
  readonly payment = input<PaymentRecord | null>(null);
  readonly title = input<string>("Comprobante de Ingreso");
  readonly subtitle = input<string>("Ticket emitido exitosamente");

  readonly closed = output();

  readonly qrDataUrl = signal<string>("");

  readonly publicUrl = computed<string>(() => {
    const t = this.ticket();
    if (!t?.id) {
      return "";
    }
    const origin =
      globalThis.window?.location?.origin ?? "https://app.nivo.dev";
    return `${origin}/t/${t.id}`;
  });

  readonly whatsAppLink = computed<string>(() => {
    const t = this.ticket();
    if (!t) {
      return "";
    }
    const url = this.publicUrl();
    const plate = t.licensePlate || this.texts.unplatedVehicle;
    const msg = encodeURIComponent(this.texts.whatsAppMessage(plate, url));
    const rawPhone = t.phoneNumber ? t.phoneNumber.replaceAll(/\D/gu, "") : "";
    let phone = "";
    if (rawPhone) {
      phone = rawPhone.startsWith("57") ? rawPhone : `57${rawPhone}`;
    }

    if (phone) {
      return `https://wa.me/${phone}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
  });

  constructor() {
    effect(async () => {
      const url = this.publicUrl();
      if (!url) {
        this.qrDataUrl.set("");
        return;
      }

      try {
        const svg = await QRCode.toString(url, {
          errorCorrectionLevel: "M",
          margin: 1,
          type: "svg",
          width: 160,
        });
        this.qrDataUrl.set(
          `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
        );
      } catch {
        this.qrDataUrl.set("");
      }
    });
  }

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

  readonly formatDate = TicketReceiptComponent.formatDate;

  static onPrint(): void {
    window.print();
  }

  readonly onPrint = TicketReceiptComponent.onPrint;

  onClose(): void {
    this.closed.emit();
  }
}
