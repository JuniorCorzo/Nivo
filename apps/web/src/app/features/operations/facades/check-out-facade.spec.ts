import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";
import type {
  PaymentRecord,
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { CheckOutFacade } from "./check-out.facade";

interface MockTicketService {
  calculatePrice: ReturnType<typeof vi.fn>;
  checkOutVehicle: ReturnType<typeof vi.fn>;
  getActiveTicketBySlot: ReturnType<typeof vi.fn>;
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, SlotSummary[]>;
}

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
  parkingLots: () => unknown[];
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("CheckOutFacade", () => {
  let facade: CheckOutFacade;
  let ticketServiceSpy: MockTicketService;
  let slotServiceSpy: MockSlotService;
  let parkingServiceSpy: MockParkingService;
  let toastSpy: MockToastService;

  beforeEach(() => {
    ticketServiceSpy = {
      calculatePrice: vi.fn().mockReturnValue(
        of({
          breakdown: [],
          ivaAmount: 950,
          ivaRate: 19,
          name: "Tarifa",
          subtotal: 5000,
          total: 5950,
        })
      ),
      checkOutVehicle: vi.fn(),
      getActiveTicketBySlot: vi.fn(),
    };
    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
      summaries: () => ({
        "parking-1": [
          {
            hasCharger: false,
            id: "slot-occ-1",
            isAccessible: false,
            isActive: true,
            parkingName: "Central",
            prefix: "A",
            slotNumber: "101",
            status: "OCCUPIED",
            type: "CAR",
            zone: "Z1",
          },
          {
            hasCharger: false,
            id: "slot-avail-2",
            isAccessible: false,
            isActive: true,
            parkingName: "Central",
            prefix: "A",
            slotNumber: "102",
            status: "AVAILABLE",
            type: "CAR",
            zone: "Z1",
          },
        ],
      }),
    };
    parkingServiceSpy = {
      getAll: vi.fn(),
      parkingLots: () => [],
    };
    toastSpy = { showToast: vi.fn() };

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
    ticketServiceSpy.calculatePrice.mockReturnValue(of(mockCalculation));

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
    ticketServiceSpy.calculatePrice.mockReturnValue(of(zeroCalculation));

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
    ticketServiceSpy.checkOutVehicle.mockReturnValue(of(mockPayment));

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
      expect.objectContaining({ type: "success" })
    );
  });

  it("should filter and return only occupied slots", () => {
    facade.init("parking-1");
    expect(facade.occupiedSlots().length).toBe(1);
    expect(facade.occupiedSlots()[0].id).toBe("slot-occ-1");
  });

  it("should load ticket and calculate price when selectSlot is called", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-from-slot",
      licensePlate: "SLOT123",
      status: "OPEN",
    };
    ticketServiceSpy.getActiveTicketBySlot.mockReturnValue(of(mockTicket));

    facade.init("parking-1");
    const [slot] = facade.occupiedSlots();
    facade.selectSlot(slot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith(
      "slot-occ-1"
    );
    expect(facade.selectedTicket()).toEqual(mockTicket);
    expect(ticketServiceSpy.calculatePrice).toHaveBeenCalledWith(
      "ticket-from-slot"
    );
  });

  it("should clear selected ticket and reload occupied slots", () => {
    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-1",
      licensePlate: "ABC123",
      status: "OPEN",
    };
    facade.init("parking-1");
    facade.selectTicket(ticket);
    expect(facade.selectedTicket()).toEqual(ticket);

    facade.clearSelectedTicket();
    expect(facade.selectedTicket()).toBeNull();
    expect(slotServiceSpy.getAllSlotSummariesByParkingId).toHaveBeenCalledWith(
      "parking-1"
    );
  });

  it("should return false for isZeroPayment and canCheckOut when priceCalculation is null", () => {
    facade.init("parking-1");
    expect(facade.priceCalculation()).toBeNull();
    expect(facade.isZeroPayment()).toBe(false);
    expect(facade.canCheckOut()).toBe(false);
  });

  it("should not allow checkout when calculatePrice fails", () => {
    ticketServiceSpy.calculatePrice.mockReturnValue(
      throwError(() => new Error("Network error"))
    );

    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-err",
      licensePlate: "ERR999",
      status: "OPEN",
    };

    facade.selectTicket(ticket);

    expect(facade.selectedTicket()).toEqual(ticket);
    expect(facade.priceCalculation()).toBeNull();
    expect(facade.isZeroPayment()).toBe(false);
    expect(facade.canCheckOut()).toBe(false);
    expect(facade.errorMessage()).toBe("Network error");
  });
});
