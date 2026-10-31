import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { CheckoutPaymentMethod } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCoins, lucideCreditCard, lucideQrCode } from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideCoins,
      lucideCreditCard,
      lucideQrCode,
    }),
  ],
  selector: "app-payment-method-selector",
  standalone: true,
  templateUrl: "./payment-method-selector.html",
})
export class PaymentMethodSelectorComponent {
  readonly paymentMethod = input.required<CheckoutPaymentMethod>();
  readonly isZeroPayment = input<boolean>(false);
  readonly isPaymentModuleEnabled = input<boolean>(true);

  readonly methodSelected = output<CheckoutPaymentMethod>();

  readonly texts = APP_TEXTS.operations.checkoutModal.payment;

  isPaymentMethodActive(method: CheckoutPaymentMethod): boolean {
    const current = this.paymentMethod();
    if (method === "PAY_LINK" || method === "CARD") {
      return current === "PAY_LINK" || current === "CARD";
    }
    return current === method;
  }

  selectPaymentMethod(method: CheckoutPaymentMethod): void {
    this.methodSelected.emit(method);
  }
}
