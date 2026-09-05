import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { CheckInFacade } from "./check-in.facade";

interface MockTicketService {
  createTicket: ReturnType<typeof vi.fn>;
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, unknown[]>;
}

interface MockRateService {
  getRatesByParkingId: ReturnType<typeof vi.fn>;
  ratesByParking: () => Record<string, unknown[]>;
}

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
  parkingLots: () => ParkingLotListItemModel[];
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("CheckInFacade", () => {
  let facade: CheckInFacade;
  let ticketServiceSpy: MockTicketService;
  let slotServiceSpy: MockSlotService;
  let rateServiceSpy: MockRateService;
  let parkingServiceSpy: MockParkingService;
  let toastSpy: MockToastService;

  beforeEach(() => {
    ticketServiceSpy = { createTicket: vi.fn() };
    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
      summaries: () => ({
        "parking-1": [
          {
            id: "slot-1",
            parkingName: "Central",
            prefix: "A",
            slotNumber: "101",
            status: "AVAILABLE",
            type: "CAR",
            zone: "Z1",
          },
        ],
      }),
    };
    rateServiceSpy = {
      getRatesByParkingId: vi.fn().mockReturnValue(of([])),
      ratesByParking: () => ({
        "parking-1": [
          {
            createdAt: "",
            description: "Hora",
            id: "rate-1",
            minChargeTimeMinutes: 15,
            name: "Tarifa Carros",
            parkingId: "parking-1",
            pricePerUnit: 4000,
            timeUnit: "HOURS",
            updatedAt: "",
            vehicleType: "CAR",
          },
        ],
      }),
    };
    const mockLot: ParkingLotListItemModel = {
      address: {
        city: "Bogota",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 1",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6, longitude: -74 },
      createdAt: "",
      currency: "COP",
      id: "parking-1",
      name: "Central",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 100,
      updatedAt: "",
    };
    parkingServiceSpy = {
      getAll: vi.fn(),
      parkingLots: () => [mockLot],
    };
    toastSpy = { showToast: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        CheckInFacade,
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    facade = TestBed.inject(CheckInFacade);
  });

  it("should initialize and load slots and rates for parking lot", () => {
    facade.init("parking-1");

    expect(facade.parkingId()).toBe("parking-1");
    expect(slotServiceSpy.getAllSlotSummariesByParkingId).toHaveBeenCalledWith(
      "parking-1"
    );
    expect(rateServiceSpy.getRatesByParkingId).toHaveBeenCalledWith(
      "parking-1"
    );
  });

  it("should normalize license plate to uppercase and trimmed", () => {
    facade.setPlate("  xyz456  ");
    expect(facade.plate()).toBe("XYZ456");
  });

  it("should auto-select slot and rate on vehicle type change", () => {
    facade.init("parking-1");
    facade.setVehicleType("CAR");

    expect(facade.selectedSlotId()).toBe("slot-1");
    expect(facade.selectedRateId()).toBe("rate-1");
    expect(facade.hasAvailableSlots()).toBe(true);
  });

  it("should validate form correctly based on plate, slot, rate selection", () => {
    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlate("AB");
    expect(facade.isValid()).toBe(false);

    facade.setPlate("ABC-123");
    expect(facade.isValid()).toBe(true);
  });

  it("should submit check-in, set issued ticket and open receipt on success", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-new",
      licensePlate: "ABC123",
      status: "OPEN",
    };
    ticketServiceSpy.createTicket.mockReturnValue(of(mockTicket));

    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlate("ABC123");
    facade.setEmail("test@email.com");

    facade.submitCheckIn();

    expect(ticketServiceSpy.createTicket).toHaveBeenCalledWith({
      email: "test@email.com",
      plate: "ABC123",
      rateId: "rate-1",
      slotId: "slot-1",
    });
    expect(facade.lastIssuedTicket()).toEqual(mockTicket);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(facade.plate()).toBe("");
  });

  it("should handle conflict / duplicate plate error and set error message", () => {
    ticketServiceSpy.createTicket.mockReturnValue(
      throwError(() => ({
        error: { message: "Vehículo ya tiene un ticket activo" },
      }))
    );

    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlate("ABC123");

    facade.submitCheckIn();

    expect(facade.errorMessage()).toBe("Vehículo ya tiene un ticket activo");
    expect(toastSpy.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" })
    );
  });
});
