import { CommonModule, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideBarcode,
  lucideCar,
  lucideClock,
  lucideLoader2,
  lucideParkingSquare,
  lucideSearch,
  lucideTicket,
  lucideX,
} from "@ng-icons/lucide";
import { BadgeComponent } from "@nivo-sass/design-system";

import { CheckOutFacade } from "../../../../facades/check-out.facade";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, CommonModule, DatePipe, NgIcon],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBarcode,
      lucideCar,
      lucideClock,
      lucideLoader2,
      lucideParkingSquare,
      lucideSearch,
      lucideTicket,
      lucideX,
    }),
  ],
  selector: "app-identification-step",
  standalone: true,
  templateUrl: "./identification-step.html",
})
export class IdentificationStepComponent {
  readonly facade = inject(CheckOutFacade);

  onSearchInput(event: Event): void {
    /* SAFETY: Target of search input is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setSearchQuery(target.value);
  }

  onClearSearch(): void {
    this.facade.setSearchQuery("");
  }
}
