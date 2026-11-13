import { CommonModule } from "@angular/common";
import {
  Component,
  ChangeDetectionStrategy,
  effect,
  inject,
  input,
  output,
  untracked,
} from "@angular/core";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { PlateCountry } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideLoader2,
  lucideLogIn,
  lucideParkingSquare,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { detectPlateCountry, formatPlate } from "@shared/utils/plate.utils";

import { CheckInFacade } from "../../../facades/check-in.facade";
import { TicketDeliveryCardComponent } from "../../receipt/ticket-delivery-card/ticket-delivery-card";
import { TicketReceiptComponent } from "../../receipt/ticket-receipt/ticket-receipt";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CommonModule,
    NgIcon,
    TicketDeliveryCardComponent,
    TicketReceiptComponent,
  ],
  providers: [
    CheckInFacade,
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideLoader2,
      lucideLogIn,
      lucideParkingSquare,
      lucideX,
    }),
  ],
  selector: "app-check-in-modal",
  standalone: true,
  styleUrl: "./check-in-modal.css",
  templateUrl: "./check-in-modal.html",
})
export class CheckInModalComponent {
  readonly texts = APP_TEXTS.checkIn;
  readonly facade = inject(CheckInFacade);

  readonly isOpen = input<boolean>(false);
  readonly parkingId = input<string | null>(null);
  readonly preselectedSlot = input<SlotSummary | null>(null);
  readonly initialUnplated = input<boolean>(false);
  readonly initialPlate = input<string>("");
  readonly initialPhotoUrl = input<string | null>(null);

  readonly closed = output();

  constructor() {
    effect(() => {
      const pId = this.parkingId();
      if (pId) {
        untracked(() => {
          this.facade.init(pId);
        });
      }
    });

    effect(() => {
      if (this.isOpen()) {
        untracked(() => {
          this.facade.reset();
          if (this.initialUnplated()) {
            this.facade.setIsUnplated(true);
          }
          if (this.initialPhotoUrl()) {
            this.facade.setPhotoUrl(this.initialPhotoUrl());
          }
          const initPlate = this.initialPlate();
          if (initPlate) {
            const detected = detectPlateCountry(initPlate);
            const formatted = formatPlate(initPlate, { country: detected });
            this.facade.setPlate(formatted, detected === "VE" ? "VE" : "CO");
          }
          const preselected = this.preselectedSlot();
          if (preselected) {
            const vType: VehicleType =
              preselected.type === "MOTORCYCLE" || preselected.type === "BIKE"
                ? preselected.type
                : "CAR";
            this.facade.setVehicleType(vType);
            this.facade.setSlotId(preselected.id);
          }
        });
      }
    });
  }

  onPhoneChange(phone: string): void {
    this.facade.setPhoneNumber(phone);
  }

  onEmailChange(email: string): void {
    this.facade.setEmail(email);
  }

  onDeliveryChannelChange(channel: "PRINT" | "WHATSAPP" | "EMAIL" | string): void {
    if (channel === "EMAIL" || channel === "WHATSAPP" || channel === "PRINT") {
      this.facade.setDeliveryMethod(channel);
    }
  }

  onSlotChange(event: Event): void {
    /* SAFETY: Target is HTMLSelectElement */
    const target = event.target as HTMLSelectElement;
    this.facade.setSlotId(target.value || null);
  }

  onRateChange(event: Event): void {
    /* SAFETY: Target is HTMLSelectElement */
    const target = event.target as HTMLSelectElement;
    this.facade.setRateId(target.value || null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.facade.submitCheckIn();
  }

  onClose(): void {
    this.closed.emit();
  }
}
