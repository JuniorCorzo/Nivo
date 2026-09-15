import { CommonModule, DecimalPipe } from "@angular/common";
import { Component, ChangeDetectionStrategy, effect, inject, input, output } from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideArrowLeft,
  lucideCar,
  lucideCheck,
  lucideCoins,
  lucideLoader2,
  lucideLogOut,
  lucideParkingSquare,
  lucideX,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";

import { CheckOutFacade } from "../../facades/check-out.facade";
import { TicketReceiptComponent } from "../ticket-receipt/ticket-receipt";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CommonModule,
    DecimalPipe,
    NgIcon,
    TicketReceiptComponent,
  ],
  providers: [
    CheckOutFacade,
    provideIcons({
      lucideAlertCircle,
      lucideArrowLeft,
      lucideCar,
      lucideCheck,
      lucideCoins,
      lucideLoader2,
      lucideLogOut,
      lucideParkingSquare,
      lucideX,
    }),
  ],
  selector: "app-check-out-modal",
  standalone: true,
  styleUrl: "./check-out-modal.css",
  templateUrl: "./check-out-modal.html",
})
export class CheckOutModalComponent {
  readonly facade = inject(CheckOutFacade);

  readonly isOpen = input<boolean>(false);
  readonly parkingId = input<string | null>(null);
  readonly ticket = input<TicketSummary | null>(null);

  readonly closed = output();

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
      } else if (!t && this.isOpen()) {
        const pId = this.parkingId();
        if (pId) {
          this.facade.loadOccupiedSlots(pId);
        }
      }
    });
  }

  onEmailInput(event: Event): void {
    /* SAFETY: Target of email input event is HTMLInputElement */
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
