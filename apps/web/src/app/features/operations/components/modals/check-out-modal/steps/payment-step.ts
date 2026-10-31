import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowLeft,
  lucideCar,
  lucideCheck,
  lucideLoader2,
  lucideLogOut,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateFormatPipe } from "@shared/pipes/plate-format.pipe";

import { CheckOutFacade } from "../../../../facades/check-out.facade";
import { PaymentMethodSelectorComponent } from "../components/payment-method-selector/payment-method-selector";
import { ReceiptDeliverySelectorComponent } from "../components/receipt-delivery-selector/receipt-delivery-selector";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CommonModule,
    DecimalPipe,
    NgIcon,
    PaymentMethodSelectorComponent,
    PlateFormatPipe,
    ReceiptDeliverySelectorComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCar,
      lucideCheck,
      lucideLoader2,
      lucideLogOut,
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

  readonly texts = APP_TEXTS.operations.checkoutModal;

  readonly isEmailValid = computed<boolean>(() => {
    const email = this.facade.receiptEmail().trim();
    if (!email) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });

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
