import { CommonModule, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { PriceDetailedModel } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCheck,
  lucideLoader2,
} from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCheck,
      lucideLoader2,
    }),
  ],
  selector: "app-tariff-breakdown",
  standalone: true,
  templateUrl: "./tariff-breakdown.html",
})
export class TariffBreakdownComponent {
  readonly priceCalculation = input<PriceDetailedModel | null>(null);
  readonly isLoading = input<boolean>(false);

  readonly texts = APP_TEXTS.operations.checkoutModal.settlement;

  readonly isZeroPayment = computed<boolean>(() => {
    const calc = this.priceCalculation();
    return calc !== null && calc.total <= 0;
  });
}
