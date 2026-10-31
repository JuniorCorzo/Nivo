import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideCheck,
    }),
  ],
  selector: "app-checkout-stepper",
  standalone: true,
  templateUrl: "./checkout-stepper.html",
})
export class CheckOutStepperComponent {
  readonly activeStep = input.required<number>();
  readonly texts = APP_TEXTS.operations.checkoutModal.steps;
}
