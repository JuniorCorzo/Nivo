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
  lucideCamera,
  lucideLogOut,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { CheckOutFacade } from "../../../facades/check-out.facade";
import { TicketReceiptComponent } from "../../receipt/ticket-receipt/ticket-receipt";
import { CheckOutStepperComponent } from "./components/checkout-stepper/checkout-stepper";
import { IdentificationStepComponent } from "./steps/identification-step";
import { PaymentStepComponent } from "./steps/payment-step";
import { SettlementStepComponent } from "./steps/settlement-step";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CheckOutStepperComponent,
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
      lucideCamera,
      lucideLogOut,
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
  readonly texts = APP_TEXTS.operations.checkoutModal;

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

  onConfirmCheckOut(): void {
    this.facade.confirmCheckOut();
  }

  onClose(): void {
    this.facade.reset();
    this.closed.emit();
  }
}
