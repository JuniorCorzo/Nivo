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
import { FormField } from "@angular/forms/signals";
import type { VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideLoader2,
  lucideLogIn,
  lucideParkingSquare,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent, InputComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import {
  PLATE_STATE_MACHINE,
  formatPlate,
  isColombianMotoPlate,
  normalizeRawPlate,
  resolvePlatedCountry,
} from "@shared/utils/plate.utils";

import { CheckInFacade } from "../../../facades/check-in.facade";
import { PhotoCaptureComponent } from "../../photo-capture/photo-capture.component";
import { TicketDeliveryCardComponent } from "../../receipt/ticket-delivery-card/ticket-delivery-card";
import { TicketReceiptComponent } from "../../receipt/ticket-receipt/ticket-receipt";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CommonModule,
    FormField,
    InputComponent,
    NgIcon,
    PhotoCaptureComponent,
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
        untracked(() => this.initializeModalState());
      }
    });
  }

  /**
   * Updates phone number and automatically switches delivery channel to WHATSAPP.
   * If the input is emptied, falls back to EMAIL when an email is configured, or PRINT otherwise.
   */
  onPhoneChange(phone: string): void {
    this.facade.setPhoneNumber(phone);
    this.syncDeliveryChannel("WHATSAPP", phone, "EMAIL", this.facade.email());
  }

  /**
   * Updates email address and automatically switches delivery channel to EMAIL.
   * If the input is emptied, falls back to WHATSAPP when a phone number is configured, or PRINT otherwise.
   */
  onEmailChange(email: string): void {
    this.facade.setEmail(email);
    this.syncDeliveryChannel(
      "EMAIL",
      email,
      "WHATSAPP",
      this.facade.phoneNumber()
    );
  }

  private syncDeliveryChannel(
    channel: "WHATSAPP" | "EMAIL",
    activeValue: string,
    fallbackChannel: "WHATSAPP" | "EMAIL",
    fallbackValue: string
  ): void {
    if (activeValue.trim()) {
      this.facade.setDeliveryMethod(channel);
      return;
    }
    this.facade.setDeliveryMethod(
      fallbackValue.trim() ? fallbackChannel : "PRINT"
    );
  }

  private initializeModalState(): void {
    this.facade.reset();
    const isUnplated = this.initialUnplated();
    if (isUnplated) {
      this.facade.setIsUnplated(true);
    }
    if (this.initialPhotoUrl()) {
      this.facade.setPhotoUrl(this.initialPhotoUrl());
    }
    const initPlate = this.initialPlate();
    if (!isUnplated && initPlate) {
      this.applyInitialPlate(initPlate);
    }
    const preselected = this.preselectedSlot();
    if (preselected) {
      this.applyPreselectedSlot(preselected);
    }
  }

  private applyInitialPlate(initPlate: string): void {
    const country = resolvePlatedCountry(initPlate);
    this.facade.setPlate(formatPlate(initPlate, country), country);
    if (!this.preselectedSlot() && isColombianMotoPlate(initPlate)) {
      this.facade.setVehicleType("MOTORCYCLE");
    }
  }

  private applyPreselectedSlot(preselected: SlotSummary): void {
    const vType: VehicleType =
      preselected.type === "MOTORCYCLE" || preselected.type === "BIKE"
        ? preselected.type
        : "CAR";
    this.facade.setVehicleType(vType);
    this.facade.setSlotId(preselected.id);
  }

  onDeliveryChannelChange(
    channel: "PRINT" | "WHATSAPP" | "EMAIL" | string
  ): void {
    if (channel === "EMAIL" || channel === "WHATSAPP" || channel === "PRINT") {
      this.facade.setDeliveryMethod(channel);
    }
  }

  onPlateInput(event: Event): void {
    /* SAFETY: event.target is HTMLInputElement from the plate input element */
    const inputEl = event.target as HTMLInputElement;
    const value = inputEl?.value ?? "";
    const country = resolvePlatedCountry(value);
    const formatted = formatPlate(value, country);
    this.facade.setPlate(formatted, country);
    if (!this.preselectedSlot()) {
      const normalized = normalizeRawPlate(value);
      const targetType = this.resolveVehicleTypeFromPlate(normalized, country);
      if (targetType && this.facade.vehicleType() !== targetType) {
        this.facade.setVehicleType(targetType);
      }
    }
  }

  private resolveVehicleTypeFromPlate(
    normalizedPlate: string,
    country: "CO" | "VE"
  ): VehicleType | null {
    if (isColombianMotoPlate(normalizedPlate)) {
      return "MOTORCYCLE";
    }
    if (
      (country === "CO" && PLATE_STATE_MACHINE.CO.validate(normalizedPlate)) ||
      (country === "VE" && PLATE_STATE_MACHINE.VE.validate(normalizedPlate))
    ) {
      return "CAR";
    }
    return null;
  }

  onPhotoCaptured(photoUrl: string): void {
    this.facade.setPhotoUrl(photoUrl);
  }

  onPhotoCleared(): void {
    this.facade.setPhotoUrl(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.facade.submitCheckIn();
  }

  onClose(): void {
    this.closed.emit();
  }
}
