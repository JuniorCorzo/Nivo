import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideCar,
  lucideCamera,
  lucideCheck,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateFormatPipe } from "@shared/pipes/plate-format.pipe";

import { CheckOutFacade } from "../../../../facades/check-out.facade";
import {
  StayTimelineComponent,
  type StayDurationResult,
} from "../components/stay-timeline/stay-timeline";
import { TariffBreakdownComponent } from "../components/tariff-breakdown/tariff-breakdown";

export type { StayDurationResult };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    ButtonComponent,
    CommonModule,
    NgIcon,
    PlateFormatPipe,
    StayTimelineComponent,
    TariffBreakdownComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCamera,
      lucideCar,
      lucideCheck,
    }),
  ],
  selector: "app-settlement-step",
  standalone: true,
  templateUrl: "./settlement-step.html",
})
export class SettlementStepComponent {
  readonly facade = inject(CheckOutFacade);

  readonly continue = output();
  readonly nextStep = output();
  readonly changeVehicle = output();

  readonly texts = APP_TEXTS.operations.checkoutModal;

  readonly stayDuration = computed<StayDurationResult>(() => {
    const ticket = this.facade.selectedTicket();
    if (!ticket?.entryTime) {
      return {
        formatted: "0m",
        hours: 0,
        minutes: 0,
        totalMinutes: 0,
      };
    }

    const entry = new Date(ticket.entryTime).getTime();
    const exit = ticket.exitTime
      ? new Date(ticket.exitTime).getTime()
      : Date.now();
    const diffMs = Math.max(0, exit - entry);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let formatted = "";
    if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else {
      formatted = `${minutes}m`;
    }

    return {
      formatted,
      hours,
      minutes,
      totalMinutes,
    };
  });

  readonly calculationTime = computed<Date>(() => {
    const ticket = this.facade.selectedTicket();
    if (ticket?.exitTime) {
      return new Date(ticket.exitTime);
    }
    return new Date();
  });

  onChangeVehicle(): void {
    this.facade.clearSelectedTicket();
    this.changeVehicle.emit();
  }

  onContinue(): void {
    this.continue.emit();
    this.nextStep.emit();
    this.facade.proceedToPayment();
  }
}
