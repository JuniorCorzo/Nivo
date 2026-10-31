import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideArrowLeft,
  lucideArrowRight,
  lucideCar,
  lucideCheck,
  lucideCoins,
  lucideCreditCard,
  lucideLoader2,
  lucideLogOut,
  lucideParkingSquare,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";

import { CheckOutFacade } from "../../../facades/check-out.facade";
import { TicketReceiptComponent } from "../../receipt/ticket-receipt/ticket-receipt";
import { IdentificationStepComponent } from "./steps/identification-step";
import { PaymentStepComponent } from "./steps/payment-step";
import { SettlementStepComponent } from "./steps/settlement-step";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CommonModule,
    IdentificationStepComponent,
    NgIcon,
    PaymentStepComponent,
    SettlementStepComponent,
    TicketReceiptComponent,
  ],
  providers: [
    CheckOutFacade,
    provideIcons({
      lucideAlertCircle,
      lucideArrowLeft,
      lucideArrowRight,
      lucideCar,
      lucideCheck,
      lucideCoins,
      lucideCreditCard,
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

  readonly activeStep = computed(() => this.facade.activeStep());

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const pId = this.parkingId();
      const t = this.ticket();

      if (!open || !pId) {
        return;
      }

      this.facade.init(pId);

      if (t) {
        this.facade.selectTicket(t);
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
