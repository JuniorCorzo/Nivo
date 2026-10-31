import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import type { TicketSendVia } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertCircle, lucideMail, lucidePrinter } from "@ng-icons/lucide";
import { InputComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, InputComponent, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideMail,
      lucidePrinter,
    }),
  ],
  selector: "app-receipt-delivery-selector",
  standalone: true,
  templateUrl: "./receipt-delivery-selector.html",
})
export class ReceiptDeliverySelectorComponent {
  readonly sendVia = input.required<TicketSendVia>();
  readonly receiptEmail = input<string>("");
  readonly emailTouched = input<boolean>(false);
  readonly isEmailValid = input<boolean>(false);

  readonly sendViaSelected = output<TicketSendVia>();
  readonly emailChanged = output<string>();
  readonly emailBlurred = output<void>();

  readonly texts = APP_TEXTS.operations.checkoutModal.payment;

  readonly emailErrors = computed(() => {
    if (this.emailTouched() && !this.isEmailValid()) {
      return [{ message: this.texts.invalidEmail }];
    }
    return [];
  });

  selectSendVia(sendVia: TicketSendVia): void {
    this.sendViaSelected.emit(sendVia);
  }

  onEmailInput(event: Event): void {
    /* SAFETY: Target of email input event is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.emailChanged.emit(target.value);
  }

  onEmailBlur(): void {
    this.emailBlurred.emit();
  }
}
