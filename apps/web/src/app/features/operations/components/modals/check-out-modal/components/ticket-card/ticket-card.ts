import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight, lucideCar, lucideClock } from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateFormatPipe } from "@shared/pipes/plate-format.pipe";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, DatePipe, NgIcon, PlateFormatPipe],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCar,
      lucideClock,
    }),
  ],
  selector: "app-checkout-ticket-card",
  standalone: true,
  templateUrl: "./ticket-card.html",
})
export class TicketCardComponent {
  readonly ticket = input.required<TicketSummary>();
  readonly selected = output<TicketSummary>();

  readonly texts = APP_TEXTS.operations.checkoutModal;
}
