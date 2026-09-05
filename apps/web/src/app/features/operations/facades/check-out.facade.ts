import { Injectable, computed, inject, signal } from "@angular/core";
import type {
  CheckOutPayload,
  PaymentRecord,
  PriceDetailedModel,
  TicketPaymentMethod,
  TicketSendVia,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";

@Injectable()
export class CheckOutFacade {
  private readonly ticketService = inject(TicketService);
  private readonly slotService = inject(SlotService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);

  readonly parkingId = signal<string | null>(null);
  readonly selectedTicket = signal<TicketSummary | null>(null);
  readonly priceCalculation = signal<PriceDetailedModel | null>(null);

  readonly isLoadingCalculation = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly sendVia = signal<TicketSendVia>("URL");
  readonly paymentMethod = signal<TicketPaymentMethod>("EFFECTIVE");
  readonly receiptEmail = signal<string>("");

  readonly lastPaymentRecord = signal<PaymentRecord | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);

  readonly isZeroPayment = computed<boolean>(() => {
    const calc = this.priceCalculation();
    if (!calc) {
      return true;
    }
    return calc.total <= 0;
  });

  readonly canCheckOut = computed<boolean>(
    () =>
      this.selectedTicket() !== null &&
      !this.isLoadingCalculation() &&
      !this.isSubmitting()
  );

  init(parkingId: string): void {
    this.parkingId.set(parkingId);
  }

  selectTicket(ticket: TicketSummary): void {
    this.selectedTicket.set(ticket);
    this.errorMessage.set(null);
    this.priceCalculation.set(null);
    this.loadPriceCalculation(ticket.id);
  }

  loadPriceCalculation(ticketId: string): void {
    this.isLoadingCalculation.set(true);
    this.errorMessage.set(null);

    this.ticketService.calculatePrice(ticketId).subscribe({
      error: (err) => {
        this.isLoadingCalculation.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          "Error al calcular la tarifa de salida.";
        this.errorMessage.set(errorMsg);
        this.toast.showToast({ message: errorMsg, type: "error" });
      },
      next: (calculation) => {
        this.isLoadingCalculation.set(false);
        this.priceCalculation.set(calculation);
      },
    });
  }

  setSendVia(sendVia: TicketSendVia): void {
    this.sendVia.set(sendVia);
  }

  setPaymentMethod(method: TicketPaymentMethod): void {
    this.paymentMethod.set(method);
  }

  setReceiptEmail(email: string): void {
    this.receiptEmail.set(email.trim());
  }

  confirmCheckOut(): void {
    const ticket = this.selectedTicket();
    if (!ticket || !this.canCheckOut()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: CheckOutPayload = {
      email: this.sendVia() === "EMAIL" ? this.receiptEmail() : undefined,
      paymentMethod: this.paymentMethod(),
      sendVia: this.sendVia(),
      ticketId: ticket.id,
    };

    this.ticketService.checkOutVehicle(payload).subscribe({
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          "Error al procesar la salida del vehículo.";
        this.errorMessage.set(errorMsg);
        this.toast.showToast({ message: errorMsg, type: "error" });
      },
      next: (payment) => {
        this.isSubmitting.set(false);
        this.lastPaymentRecord.set(payment);
        this.isReceiptOpen.set(true);
        this.toast.showToast({
          message: "Salida procesada con éxito",
          type: "success",
        });

        const pId = this.parkingId();
        if (pId) {
          this.slotService.getAllSlotSummariesByParkingId(pId).subscribe();
        }
      },
    });
  }

  closeReceipt(): void {
    this.isReceiptOpen.set(false);
    this.selectedTicket.set(null);
    this.priceCalculation.set(null);
    this.lastPaymentRecord.set(null);
  }

  reset(): void {
    this.selectedTicket.set(null);
    this.priceCalculation.set(null);
    this.errorMessage.set(null);
    this.lastPaymentRecord.set(null);
    this.isReceiptOpen.set(false);
  }
}
