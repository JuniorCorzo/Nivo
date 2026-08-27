import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle2, lucidePrinter, lucideX } from '@ng-icons/lucide';

import { PaymentRecord, TicketSummary } from '@core/models/ticket.model';

@Component({
  selector: 'app-ticket-receipt',
  standalone: true,
  imports: [CommonModule, DecimalPipe, NgIcon],
  providers: [provideIcons({ lucideCheckCircle2, lucidePrinter, lucideX })],
  templateUrl: './ticket-receipt.component.html',
  styleUrl: './ticket-receipt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketReceiptComponent {
  readonly isOpen = input<boolean>(false);
  readonly ticket = input<TicketSummary | null>(null);
  readonly payment = input<PaymentRecord | null>(null);
  readonly title = input<string>('Comprobante de Ingreso');
  readonly subtitle = input<string>('Ticket emitido exitosamente');

  readonly closed = output<void>();

  formatDate(dateStr?: string): string {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.closed.emit();
  }
}
