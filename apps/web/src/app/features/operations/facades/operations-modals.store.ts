import { Injectable, signal } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";

@Injectable()
export class OperationsModalsStore {
  readonly isCheckInModalOpen = signal<boolean>(false);
  readonly selectedCheckInSlot = signal<SlotSummary | null>(null);
  readonly checkInModalInitialUnplated = signal<boolean>(false);
  readonly checkInModalInitialPlate = signal<string>("");
  readonly isCheckOutModalOpen = signal<boolean>(false);
  readonly selectedCheckoutTicket = signal<TicketSummary | null>(null);
  readonly isQrScannerOpen = signal<boolean>(false);

  openCheckIn(
    unplated = false,
    plate = "",
    slot: SlotSummary | null = null
  ): void {
    this.selectedCheckInSlot.set(slot);
    this.checkInModalInitialUnplated.set(unplated);
    this.checkInModalInitialPlate.set(unplated ? "" : plate);
    this.isCheckInModalOpen.set(true);
  }

  closeCheckIn(): void {
    this.isCheckInModalOpen.set(false);
    this.selectedCheckInSlot.set(null);
    this.checkInModalInitialUnplated.set(false);
    this.checkInModalInitialPlate.set("");
  }

  openDirectCheckOut(): void {
    this.selectedCheckoutTicket.set(null);
    this.isCheckOutModalOpen.set(true);
  }

  openCheckOutWithTicket(ticket: TicketSummary): void {
    this.selectedCheckoutTicket.set(ticket);
    this.isCheckOutModalOpen.set(true);
  }

  closeCheckOut(): void {
    this.isCheckOutModalOpen.set(false);
    this.selectedCheckoutTicket.set(null);
  }

  openQrScanner(): void {
    this.isQrScannerOpen.set(true);
  }

  closeQrScanner(): void {
    this.isQrScannerOpen.set(false);
  }
}
