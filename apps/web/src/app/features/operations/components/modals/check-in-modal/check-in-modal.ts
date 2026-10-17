import { CommonModule } from "@angular/common";
import type { ElementRef } from "@angular/core";
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import type { PlateCountry } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideBike,
  lucideCamera,
  lucideCar,
  lucideCheckCircle2,
  lucideLoader2,
  lucideLogIn,
  lucidePhone,
  lucideX,
} from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { PlateMaskDirective } from "@shared/directives/plate-mask";

import { CheckInFacade } from "../../../facades/check-in.facade";
import { PhotoCaptureComponent } from "../../photo-capture/photo-capture.component";
import { TicketReceiptComponent } from "../../receipt/ticket-receipt/ticket-receipt";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    CommonModule,
    NgIcon,
    PhotoCaptureComponent,
    PlateMaskDirective,
    TicketReceiptComponent,
  ],
  providers: [
    CheckInFacade,
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideBike,
      lucideCamera,
      lucideCar,
      lucideCheckCircle2,
      lucideLoader2,
      lucideLogIn,
      lucidePhone,
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

  readonly closed = output();

  @ViewChild("plateInput") plateInputRef?: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const pId = this.parkingId();
      if (pId) {
        this.facade.init(pId);
      }
    });

    effect(() => {
      if (this.isOpen()) {
        this.facade.reset();
        setTimeout(() => {
          this.plateInputRef?.nativeElement.focus();
        }, 50);
      }
    });
  }

  onPlateCountrySelect(country: PlateCountry): void {
    this.facade.setPlateCountry(country);
  }

  onCountryChange(country: PlateCountry): void {
    this.facade.setPlateCountry(country);
  }

  onPlateInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setPlate(target.value);
  }

  onPhoneInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setPhoneNumber(target.value);
  }

  onPhotoCaptured(photoUrl: string): void {
    this.facade.setPhotoUrl(photoUrl);
  }

  onPhotoCleared(): void {
    this.facade.setPhotoUrl(null);
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    if (this.facade.isValid()) {
      this.facade.submitCheckIn();
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

  onEmailInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setEmail(target.value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.facade.submitCheckIn();
  }

  onClose(): void {
    this.closed.emit();
  }
}
