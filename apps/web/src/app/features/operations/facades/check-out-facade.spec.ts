import { TestBed } from "@angular/core/testing";
import type {
  PaymentRecord,
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { CheckOutFacade } from "./check-out.facade";

describe("CheckOutFacade", () => {
  let facade: CheckOutFacade;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    ticketServiceSpy = jasmine.createSpyObj("TicketService", [
      "calculatePrice",
      "checkOutVehicle",
    ]);
    slotServiceSpy = jasmine.createSpyObj("SlotService", [
      "getAllSlotSummariesByParkingId",
    ]);
    parkingServiceSpy = jasmine.createSpyObj("ParkingService", ["getAll"], {
      parkingLots: () => [],
    });
    toastSpy = jasmine.createSpyObj("ToastService", ["showToast"]);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    ticketServiceSpy.calculatePrice.and.returnValue(
      of({
        breakdown: [],
        ivaAmount: 950,
        ivaRate: 19,
        name: "Tarifa",
        subtotal: 5000,
        total: 5950,
      })
    );

    TestBed.configureTestingModule({
      providers: [
        CheckOutFacade,
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    facade = TestBed.inject(CheckOutFacade);
  });

  it("should calculate price preview when selecting ticket", () => {
    const mockCalculation: PriceDetailedModel = {
      breakdown: [],
      ivaAmount: 950,
      ivaRate: 19,
      name: "Tarifa Estándar",
      subtotal: 5000,
      total: 5950,
    };
    ticketServiceSpy.calculatePrice.and.returnValue(of(mockCalculation));

    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-1",
      licensePlate: "ABC123",
      status: "OPEN",
    };

    facade.selectTicket(ticket);

    expect(facade.selectedTicket()).toEqual(ticket);
    expect(ticketServiceSpy.calculatePrice).toHaveBeenCalledWith("ticket-1");
    expect(facade.priceCalculation()).toEqual(mockCalculation);
    expect(facade.isZeroPayment()).toBe(false);
  });

  it("should identify zero-payment when total is 0", () => {
    const zeroCalculation: PriceDetailedModel = {
      breakdown: [],
      ivaAmount: 0,
      ivaRate: 0,
      name: "Tarifa Gracia",
      subtotal: 0,
      total: 0,
    };
    ticketServiceSpy.calculatePrice.and.returnValue(of(zeroCalculation));

    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-grace",
      licensePlate: "XYZ999",
      status: "OPEN",
    };

    facade.selectTicket(ticket);

    expect(facade.isZeroPayment()).toBe(true);
  });

  it("should execute check-out and open receipt on confirmation", () => {
    const mockPayment: PaymentRecord = {
      amount: 5950,
      id: "pay-1",
      paymentMethod: "EFFECTIVE",
      status: "APPROVED",
    };
    ticketServiceSpy.checkOutVehicle.and.returnValue(of(mockPayment));

    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-1",
      licensePlate: "ABC123",
      status: "OPEN",
    };

    facade.init("parking-1");
    facade.selectTicket(ticket);
    facade.setPaymentMethod("EFFECTIVE");
    facade.setSendVia("URL");

    facade.confirmCheckOut();

    expect(ticketServiceSpy.checkOutVehicle).toHaveBeenCalledWith({
      email: undefined,
      paymentMethod: "EFFECTIVE",
      sendVia: "URL",
      ticketId: "ticket-1",
    });
    expect(facade.lastPaymentRecord()).toEqual(mockPayment);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(toastSpy.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: "success" })
    );
  });
});
