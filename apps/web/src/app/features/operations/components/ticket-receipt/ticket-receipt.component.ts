import { CommonModule, DecimalPipe } from "@angular/common";
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from "@angular/core";
import type { PaymentRecord, TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheckCircle2, lucidePrinter, lucideX } from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, NgIcon],
  providers: [provideIcons({ lucideCheckCircle2, lucidePrinter, lucideX })],
  selector: "app-ticket-receipt",
  standalone: true,
  styleUrl: "./ticket-receipt.component.css",
  templateUrl: "./ticket-receipt.component.html",
})
export class TicketReceiptComponent {
  readonly isOpen = input<boolean>(false);
  readonly ticket = input<TicketSummary | null>(null);
  readonly payment = input<PaymentRecord | null>(null);
  readonly title = input<string>("Comprobante de Ingreso");
  readonly subtitle = input<string>("Ticket emitido exitosamente");

  readonly closed = output();

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
