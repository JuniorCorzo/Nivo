import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideLoader2,
  lucideParkingSquare,
  lucideSearch,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent, InputComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateFormatPipe } from "@shared/pipes/plate-format.pipe";

import { CheckOutFacade } from "../../../../facades/check-out.facade";
import { OccupiedSlotCardComponent } from "../components/occupied-slot-card/occupied-slot-card";
import { TicketCardComponent } from "../components/ticket-card/ticket-card";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    InputComponent,
    NgIcon,
    OccupiedSlotCardComponent,
    PlateFormatPipe,
    TicketCardComponent,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideParkingSquare,
      lucideSearch,
      lucideX,
    }),
  ],
  selector: "app-identification-step",
  standalone: true,
  templateUrl: "./identification-step.html",
})
export class IdentificationStepComponent {
  readonly facade = inject(CheckOutFacade);
  readonly texts = {
    ...APP_TEXTS.operations.checkoutModal,
    identification: {
      ...APP_TEXTS.operations.checkoutModal.identification,
      emptyOccupiedTitle: "No hay vehículos para retirar",
    },
  };

  onSearchInput(event: Event): void {
    /* SAFETY: Target of search input is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setSearchQuery(target.value);
  }

  onClearSearch(): void {
    this.facade.setSearchQuery("");
  }
}
