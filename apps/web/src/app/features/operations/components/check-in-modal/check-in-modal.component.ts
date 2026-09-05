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
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideBike,
  lucideCar,
  lucideCheckCircle2,
  lucideLoader2,
  lucideLogIn,
  lucideX,
} from "@ng-icons/lucide";

import { CheckInFacade } from "../../facades/check-in.facade";
import { TicketReceiptComponent } from "../ticket-receipt/ticket-receipt.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIcon, TicketReceiptComponent],
  providers: [
    CheckInFacade,
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideBike,
      lucideCar,
      lucideCheckCircle2,
      lucideLoader2,
      lucideLogIn,
      lucideX,
    }),
  ],
  selector: "app-check-in-modal",
  standalone: true,
  styleUrl: "./check-in-modal.component.css",
  templateUrl: "./check-in-modal.component.html",
})
export class CheckInModalComponent {
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

  onPlateInput(event: Event): void {
    /* SAFETY: Target is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setPlate(target.value);
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
