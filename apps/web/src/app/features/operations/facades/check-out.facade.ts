import { Injectable, computed, inject, signal } from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
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

export type CheckoutPaymentMethod = TicketPaymentMethod | "CARD" | "TRANSFER";

@Injectable()
export class CheckOutFacade {
  private readonly ticketService = inject(TicketService);
  private readonly slotService = inject(SlotService);
  private readonly parkingService = inject(ParkingService);
  private readonly toast = inject(ToastService);

  readonly parkingId = signal<string | null>(null);
  readonly selectedTicket = signal<TicketSummary | null>(null);
  readonly priceCalculation = signal<PriceDetailedModel | null>(null);

  readonly searchQuery = signal<string>("");
  readonly activeTickets = signal<TicketSummary[]>([]);
  readonly activeStep = signal<1 | 2 | 3>(1);

  readonly isLoadingCalculation = signal<boolean>(false);
  readonly isLoadingOccupiedSlots = signal<boolean>(false);
  readonly isLoadingTicket = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly sendVia = signal<TicketSendVia>("URL");
  readonly paymentMethod = signal<CheckoutPaymentMethod>("EFFECTIVE");
  readonly receiptEmail = signal<string>("");

  readonly lastPaymentRecord = signal<PaymentRecord | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);

  readonly occupiedSlots = computed<SlotSummary[]>(() => {
    const id = this.parkingId();
    if (!id) {
      return [];
    }
    const slots = this.slotService.summaries()[id] ?? [];
    return slots.filter((slot) => slot.status === "OCCUPIED");
  });

  readonly filteredTickets = computed<TicketSummary[]>(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }
    return this.activeTickets().filter((ticket) => {
      const plate = ticket.licensePlate?.toLowerCase() ?? "";
      const barcode = ticket.barcode?.toLowerCase() ?? "";
      const id = ticket.id?.toLowerCase() ?? "";
      return (
        plate.includes(query) || barcode.includes(query) || id.includes(query)
      );
    });
  });

  readonly filteredOccupiedSlots = computed<SlotSummary[]>(() => {
    const slots = this.occupiedSlots();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return slots;
    }
    return slots.filter((slot) => {
      const slotNum = slot.slotNumber?.toLowerCase() ?? "";
      const prefix = slot.prefix?.toLowerCase() ?? "";
      const zone = slot.zone?.toLowerCase() ?? "";
      const combined = `${prefix ? `${prefix}-` : ""}${slotNum}`.toLowerCase();
      return (
        slotNum.includes(query) ||
        prefix.includes(query) ||
        zone.includes(query) ||
        combined.includes(query)
      );
    });
  });

  readonly isZeroPayment = computed<boolean>(() => {
    const calc = this.priceCalculation();
    if (!calc) {
      return false;
    }
    return calc.total <= 0;
  });

  readonly isEmailValid = computed<boolean>(() => {
    if (this.sendVia() !== "EMAIL") {
      return true;
    }
    const email = this.receiptEmail().trim();
    if (!email) {
      return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });

  readonly canCheckOut = computed<boolean>(
    () =>
      this.selectedTicket() !== null &&
      this.priceCalculation() !== null &&
      !this.isLoadingCalculation() &&
      !this.isLoadingTicket() &&
      !this.isSubmitting() &&
      this.isEmailValid()
  );

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setStep(step: 1 | 2 | 3): void {
    this.activeStep.set(step);
  }

  goToStep(step: 1 | 2 | 3): void {
    this.activeStep.set(step);
  }

  proceedToPayment(): void {
    this.activeStep.set(3);
  }

  backToSettlement(): void {
    this.activeStep.set(2);
  }

  init(parkingId: string): void {
    this.parkingId.set(parkingId);
    this.loadOccupiedSlots(parkingId);
  }

  loadOccupiedSlots(parkingId: string): void {
    this.isLoadingOccupiedSlots.set(true);
    this.slotService.getAllSlotSummariesByParkingId(parkingId).subscribe({
      error: () => {
        this.isLoadingOccupiedSlots.set(false);
      },
      next: () => {
        this.isLoadingOccupiedSlots.set(false);
      },
    });

    if (this.ticketService.listTicketsByParkingLot) {
      this.ticketService.listTicketsByParkingLot(parkingId).subscribe({
        error: () => {
          this.activeTickets.set([]);
        },
        next: (tickets) => {
          this.activeTickets.set(
            (tickets ?? []).filter((ticket) => ticket.status === "OPEN")
          );
        },
      });
    }
  }

  selectSlot(slot: SlotSummary): void {
    this.isLoadingTicket.set(true);
    this.errorMessage.set(null);
    this.ticketService.getActiveTicketBySlot(slot.id).subscribe({
      error: (err) => {
        this.isLoadingTicket.set(false);
        const errorMsg =
          err?.error?.message ||
          err?.message ||
          "No se encontró un ticket activo para este cupo.";
        this.errorMessage.set(errorMsg);
        this.toast.showToast({ message: errorMsg, type: "error" });
      },
      next: (ticket) => {
        this.isLoadingTicket.set(false);
        this.selectTicket(ticket);
      },
    });
  }

  clearSelectedTicket(): void {
    this.selectedTicket.set(null);
    this.priceCalculation.set(null);
    this.errorMessage.set(null);
    this.searchQuery.set("");
    this.activeStep.set(1);
    const pId = this.parkingId();
    if (pId) {
      this.loadOccupiedSlots(pId);
    }
  }

  selectTicket(ticket: TicketSummary): void {
    this.selectedTicket.set(ticket);
    this.errorMessage.set(null);
    this.priceCalculation.set(null);
    this.activeStep.set(2);
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

  setPaymentMethod(method: CheckoutPaymentMethod): void {
    this.paymentMethod.set(method);
  }

  setReceiptEmail(email: string): void {
    this.receiptEmail.set(email.trim());
  }

  confirmCheckOut(): void {
    if (this.isSubmitting()) {
      return;
    }

    const ticket = this.selectedTicket();
    if (!ticket || !this.canCheckOut()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const method = this.paymentMethod();
    const backendPaymentMethod: TicketPaymentMethod =
      method === "CARD" || method === "TRANSFER" ? "PAY_LINK" : method;

    const payload: CheckOutPayload = {
      email: this.sendVia() === "EMAIL" ? this.receiptEmail() : undefined,
      paymentMethod: backendPaymentMethod,
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
    this.searchQuery.set("");
    this.paymentMethod.set("EFFECTIVE");
    this.sendVia.set("URL");
    this.receiptEmail.set("");
    this.activeStep.set(1);
  }

  reset(): void {
    this.selectedTicket.set(null);
    this.priceCalculation.set(null);
    this.errorMessage.set(null);
    this.lastPaymentRecord.set(null);
    this.isReceiptOpen.set(false);
    this.searchQuery.set("");
    this.paymentMethod.set("EFFECTIVE");
    this.sendVia.set("URL");
    this.receiptEmail.set("");
    this.activeStep.set(1);
  }
}
