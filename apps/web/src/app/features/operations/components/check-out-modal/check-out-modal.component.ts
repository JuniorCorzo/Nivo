import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideCheck,
  lucideCoins,
  lucideCreditCard,
  lucideLoader2,
  lucideLogOut,
  lucideX,
} from '@ng-icons/lucide';

import { CheckOutFacade } from '../../facades/check-out.facade';
import { TicketReceiptComponent } from '../ticket-receipt/ticket-receipt.component';
import { TicketSummary } from '@core/models/ticket.model';

@Component({
  selector: 'app-check-out-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe, NgIcon, TicketReceiptComponent],
  providers: [
    CheckOutFacade,
    provideIcons({
      lucideLogOut,
      lucideX,
      lucideCoins,
      lucideCreditCard,
      lucideCheck,
      lucideLoader2,
      lucideAlertCircle,
    }),
  ],
  templateUrl: './check-out-modal.component.html',
  styleUrl: './check-out-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckOutModalComponent {
  readonly facade = inject(CheckOutFacade);

  readonly isOpen = input<boolean>(false);
  readonly parkingId = input<string | null>(null);
  readonly ticket = input<TicketSummary | null>(null);

  readonly closed = output<void>();

  constructor() {
    effect(() => {
      const pId = this.parkingId();
      if (pId) {
        this.facade.init(pId);
      }
    });

    effect(() => {
      const t = this.ticket();
      if (t && this.isOpen()) {
        this.facade.selectTicket(t);
      }
    });
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.facade.setReceiptEmail(target.value);
  }

  onConfirmCheckOut(): void {
    this.facade.confirmCheckOut();
  }

  onClose(): void {
    this.facade.reset();
    this.closed.emit();
  }
}
