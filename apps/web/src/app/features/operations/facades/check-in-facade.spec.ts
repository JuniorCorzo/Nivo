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

    facade.setPlate("ABC12");
    expect(facade.isValid()).toBe(false);

    facade.setPlate("ABC-123");
    expect(facade.isValid()).toBe(true);

    facade.setPlate("ABC123");
    expect(facade.isValid()).toBe(true);
  });

  it("should enforce plate length limits according to country", () => {
    facade.init("parking-1");
    facade.setPlateCountry("CO");
    facade.setPlate("ABC12345");
    expect(facade.plate()).toBe("ABC1234");

    facade.setPlateCountry("VE");
    facade.setPlate("AB123CD999");
    expect(facade.plate()).toBe("AB123CD99");
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
      phoneNumber: undefined,
      photoUrl: undefined,
      plate: "ABC123",
      plateCountry: "CO",
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

  it("should only include vehicle types that have available slots in availableVehicleTypes", () => {
    facade.init("parking-1");
    expect(facade.availableVehicleTypes()).toEqual(["CAR"]);
  });

  it("should require photoUrl for isValid and auto-select MOTORCYCLE when country is UNPLATED", () => {
    slotServiceSpy.summaries = () => ({
      "parking-1": [
        {
          id: "slot-moto-1",
          parkingName: "Central",
          prefix: "M",
          slotNumber: "M1",
          status: "AVAILABLE",
          type: "MOTORCYCLE",
          zone: "ZM",
        },
      ],
    });
    rateServiceSpy.ratesByParking = () => ({
      "parking-1": [
        {
          createdAt: "",
          description: "Hora Moto",
          id: "rate-moto-1",
          minChargeTimeMinutes: 0,
          name: "Tarifa Motos",
          parkingId: "parking-1",
          pricePerUnit: 2000,
          timeUnit: "HOURS",
          updatedAt: "",
          vehicleType: "MOTORCYCLE",
        },
      ],
    });

    facade.init("parking-1");
    facade.setPlateCountry("UNPLATED");

    expect(facade.plateCountry()).toBe("UNPLATED");
    expect(facade.isUnplated()).toBe(true);
    expect(facade.vehicleType()).toBe("MOTORCYCLE");
    expect(facade.selectedSlotId()).toBe("slot-moto-1");
    expect(facade.selectedRateId()).toBe("rate-moto-1");
    expect(facade.isValid()).toBe(false);

    facade.setPhotoUrl("data:image/jpeg;base64,samplephoto");
    expect(facade.isValid()).toBe(true);

    facade.setPhotoUrl(null);
    expect(facade.isValid()).toBe(false);
  });

  it("should validate Venezuelan plate format and set plateCountry to VE", () => {
    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlateCountry("VE");

    expect(facade.plateCountry()).toBe("VE");

    facade.setPlate("AB");
    expect(facade.isValid()).toBe(false);

    facade.setPlate("ABC123");
    expect(facade.isValid()).toBe(false);

    facade.setPlate("AB123CD");
    expect(facade.isValid()).toBe(true);
  });

  it("should submit check-in with UNPLATED, sending plateCountry, photoUrl and phoneNumber", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-unplated-1",
      licensePlate: "SIN PLACA",
      phoneNumber: "3001234567",
      photoUrl: "data:image/jpeg;base64,samplephoto",
      plateCountry: "UNPLATED",
      status: "OPEN",
    };
    ticketServiceSpy.createTicket.mockReturnValue(of(mockTicket));

    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlateCountry("UNPLATED");
    facade.setPhotoUrl("data:image/jpeg;base64,samplephoto");
    facade.setPhoneNumber("3001234567");

    facade.submitCheckIn();

    expect(ticketServiceSpy.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        phoneNumber: "3001234567",
        photoUrl: "data:image/jpeg;base64,samplephoto",
        plateCountry: "UNPLATED",
      })
    );
    expect(facade.lastIssuedTicket()).toEqual(mockTicket);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(facade.photoUrl()).toBeNull();
    expect(facade.phoneNumber()).toBe("");
  });

  it("should validate Colombian motorcycle plate with mask format AAA-00A", () => {
    slotServiceSpy.summaries = () => ({
      "parking-1": [
        {
          id: "slot-moto-1",
          parkingName: "Central",
          prefix: "M",
          slotNumber: "M1",
          status: "AVAILABLE",
          type: "MOTORCYCLE",
          zone: "ZM",
        },
      ],
    });
    rateServiceSpy.ratesByParking = () => ({
      "parking-1": [
        {
          createdAt: "",
          description: "Hora Moto",
          id: "rate-moto-1",
          minChargeTimeMinutes: 0,
          name: "Tarifa Motos",
          parkingId: "parking-1",
          pricePerUnit: 2000,
          timeUnit: "HOURS",
          updatedAt: "",
          vehicleType: "MOTORCYCLE",
        },
      ],
    });

    facade.init("parking-1");
    facade.setVehicleType("MOTORCYCLE");
    facade.setPlateCountry("CO");

    facade.setPlate("ABC-12D");
    expect(facade.isValid()).toBe(true);

    facade.setPlate("A");
    expect(facade.isValid()).toBe(false);
  });

  it("should validate Venezuelan plate with mask format AA-000-AA", () => {
    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlateCountry("VE");

    // Incomplete Venezuelan plate
    facade.setPlate("AB-123");
    expect(facade.isValid()).toBe(false);

    // Valid Venezuelan plate
    facade.setPlate("AB-123-CD");
    expect(facade.isValid()).toBe(true);
  });

  it("should submit check-in with masked plate successfully", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-10-16T10:00:00Z",
      id: "ticket-ve",
      licensePlate: "AB-123-CD",
      status: "OPEN",
    };
    ticketServiceSpy.createTicket.mockReturnValue(of(mockTicket));

    facade.init("parking-1");
    facade.setVehicleType("CAR");
    facade.setPlateCountry("VE");
    facade.setPlate("AB-123-CD");

    facade.submitCheckIn();

    expect(ticketServiceSpy.createTicket).toHaveBeenCalledWith({
      email: undefined,
      phoneNumber: undefined,
      photoUrl: undefined,
      plate: "AB-123-CD",
      plateCountry: "VE",
      rateId: "rate-1",
      slotId: "slot-1",
    });
    expect(facade.lastIssuedTicket()).toEqual(mockTicket);
  });

  describe("setIsUnplated and detected country handling", () => {
    it("should toggle unplated modality correctly", () => {
      facade.init("parking-1");
      facade.setPlate("ABC123");

      facade.setIsUnplated(true);
      expect(facade.plateCountry()).toBe("UNPLATED");
      expect(facade.isUnplated()).toBe(true);
      expect(facade.plate()).toBe("");
      expect(facade.errorMessage()).toBeNull();

      facade.setIsUnplated(false);
      expect(facade.plateCountry()).toBe("CO");
      expect(facade.isUnplated()).toBe(false);
      expect(facade.errorMessage()).toBeNull();
    });

    it("should preserve existing country when setIsUnplated(false) called on non-UNPLATED", () => {
      facade.init("parking-1");
      facade.setPlateCountry("VE");

      facade.setIsUnplated(false);
      expect(facade.plateCountry()).toBe("VE");
    });

    it("should update plateCountry when detectedCountry is provided to setPlate", () => {
      facade.init("parking-1");
      facade.setPlate("AB-123-CD", "VE");

      expect(facade.plateCountry()).toBe("VE");
      expect(facade.plate()).toBe("AB-123-CD");
    });

    it("should not override plateCountry if detectedCountry is UNPLATED", () => {
      facade.init("parking-1");
      facade.setPlateCountry("CO");
      facade.setPlate("ABC-123", "UNPLATED");

      expect(facade.plateCountry()).toBe("CO");
      expect(facade.plate()).toBe("ABC-123");
    });
  });
});
