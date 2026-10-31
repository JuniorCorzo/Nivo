import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import type { TicketSendVia } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideArrowLeft,
  lucideCar,
  lucideCheck,
  lucideCoins,
  lucideCreditCard,
  lucideLoader2,
  lucideLogOut,
  lucideMail,
  lucidePrinter,
  lucideQrCode,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";

import type { CheckoutPaymentMethod } from "../../../../facades/check-out.facade";
import { CheckOutFacade } from "../../../../facades/check-out.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, CommonModule, DecimalPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideArrowLeft,
      lucideCar,
      lucideCheck,
      lucideCoins,
      lucideCreditCard,
      lucideLoader2,
      lucideLogOut,
      lucideMail,
      lucidePrinter,
      lucideQrCode,
    }),
  ],
  selector: "app-payment-step",
  standalone: true,
  templateUrl: "./payment-step.html",
})
export class PaymentStepComponent {
  readonly facade = inject(CheckOutFacade);

  readonly back = output();
  readonly confirm = output();

  readonly emailTouched = signal<boolean>(false);

  readonly isEmailValid = computed<boolean>(() => {
    const email = this.facade.receiptEmail().trim();
    if (!email) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });

  isPaymentMethodActive(method: CheckoutPaymentMethod): boolean {
    const current = this.facade.paymentMethod();
    if (method === "PAY_LINK" || method === "CARD") {
      return current === "PAY_LINK" || current === "CARD";
    }
    return current === method;
  }

  selectPaymentMethod(method: CheckoutPaymentMethod): void {
    this.facade.setPaymentMethod(method);
  }

  selectSendVia(sendVia: TicketSendVia): void {
    this.facade.setSendVia(sendVia);
  }

  onEmailInput(event: Event): void {
    /* SAFETY: Target of email input event is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setReceiptEmail(target.value);
  }

  onEmailBlur(): void {
    this.emailTouched.set(true);
  }

  onBack(): void {
    this.back.emit();
    this.facade.backToSettlement();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.facade.confirmCheckOut();
  }
}
