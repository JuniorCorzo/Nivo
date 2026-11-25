import { TestBed } from "@angular/core/testing";
import { convertToParamMap } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { RateModel } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { BehaviorSubject, of, throwError } from "rxjs";

import { OperationsFacade } from "./operations.facade";

interface MockParkingService {
  parkingLots: () => ParkingLotListItemModel[];
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, SlotSummary[]>;
}

interface MockRateService {
  getRatesByParkingId: ReturnType<typeof vi.fn>;
  ratesByParking: () => Record<string, RateModel[]>;
}

interface MockTicketService {
  getActiveTicketBySlot: ReturnType<typeof vi.fn>;
  listTicketsByParkingLot: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "s-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Central",
  prefix: "A",
  slotNumber: "101",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z1",
  ...overrides,
});

const createRate = (overrides: Partial<RateModel> = {}): RateModel => ({
  createdAt: "",
  description: "",
  id: "r-1",
  minChargeTimeMinutes: 15,
  name: "Tarifa Carro",
  parkingId: "p-1",
  pricePerUnit: 5000,
  timeUnit: "HOURS",
  updatedAt: "",
  vehicleType: "CAR",
  ...overrides,
});

const createTicket = (
  overrides: Partial<TicketSummary> = {}
): TicketSummary => ({
  entryTime: "2026-10-16T10:00:00Z",
  id: "t-1",
  licensePlate: "ABC-123",
  plateCountry: "CO",
  slotId: "s-2",
  slotNumber: "102",
  status: "OPEN",
  ...overrides,
});

describe("OperationsFacade", () => {
  let facade: OperationsFacade;
  let parkingServiceSpy: MockParkingService;
  let slotServiceSpy: MockSlotService;
  let rateServiceSpy: MockRateService;
  let ticketServiceSpy: MockTicketService;
  let toastSpy: MockToastService;
  let slotsByParking: Record<string, SlotSummary[]>;
  let ratesByParking: Record<string, RateModel[]>;

  beforeEach(() => {
    slotsByParking = {
      "p-1": [
        createSlot({
          id: "s-1",
          slotNumber: "101",
          status: "AVAILABLE",
          type: "CAR",
        }),
        createSlot({
          id: "s-2",
          slotNumber: "102",
          status: "OCCUPIED",
          type: "CAR",
        }),
        createSlot({
          id: "s-3",
          prefix: "M",
          slotNumber: "201",
          status: "AVAILABLE",
          type: "MOTORCYCLE",
        }),
        createSlot({
          id: "s-4",
          prefix: "M",
          slotNumber: "202",
          status: "OCCUPIED",
          type: "MOTORCYCLE",
        }),
      ],
    };
    ratesByParking = {
      "p-1": [
        createRate({ id: "r-1", vehicleType: "CAR" }),
        createRate({ id: "r-2", vehicleType: "MOTORCYCLE" }),
      ],
    };

    parkingServiceSpy = {
      parkingLots: () => [
        {
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
          id: "p-1",
          name: "Parqueadero Central",
          occuppationRate: 0,
          ownerName: "Admin",
          slotDistribution: [],
          totalCapacity: 100,
          updatedAt: "",
        },
      ],
    };

    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
      summaries: () => slotsByParking,
    };

    rateServiceSpy = {
      getRatesByParkingId: vi.fn().mockReturnValue(of([])),
      ratesByParking: () => ratesByParking,
    };

    ticketServiceSpy = {
      getActiveTicketBySlot: vi.fn(),
      listTicketsByParkingLot: vi.fn().mockReturnValue(
        of([
          createTicket({
            id: "t-1",
            licensePlate: "ABC-123",
            status: "OPEN",
          }),
          createTicket({
            id: "t-closed",
            licensePlate: "OLD-000",
            status: "CLOSED",
          }),
        ])
      ),
    };

    toastSpy = { showToast: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        OperationsFacade,
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    facade = TestBed.inject(OperationsFacade);
  });

  it("should load slots, rates, and only OPEN active tickets when route paramMap emits parkingId", () => {
    facade.bindRoute(of(convertToParamMap({ parkingId: "p-1" })));

    expect(facade.parkingId()).toBe("p-1");
    expect(facade.parking()?.name).toBe("Parqueadero Central");
    expect(slotServiceSpy.getAllSlotSummariesByParkingId).toHaveBeenCalledWith(
      "p-1"
    );
    expect(rateServiceSpy.getRatesByParkingId).toHaveBeenCalledWith("p-1");
    expect(ticketServiceSpy.listTicketsByParkingLot).toHaveBeenCalledWith(
      "p-1"
    );
    expect(facade.activeTickets().map((t) => t.id)).toEqual(["t-1"]);
    expect(facade.kpiMetrics()).toEqual({
      availableCarSlotsCount: 1,
      availableMotoSlotsCount: 1,
      availableSlotsCount: 2,
      occupationBarPercentage: 50,
      occupationPercentage: 50,
      occupiedSlotsCount: 2,
      totalCarSlotsCount: 2,
      totalMotoSlotsCount: 2,
      totalSlotsCount: 4,
    });
  });

  it("should clear activeTickets when parkingId is absent", () => {
    const paramMap$ = new BehaviorSubject(
      convertToParamMap({ parkingId: "p-1" })
    );
    facade.bindRoute(paramMap$);
    expect(facade.activeTickets().length).toBe(1);

    paramMap$.next(convertToParamMap({}));
    expect(facade.parkingId()).toBeNull();
    expect(facade.activeTickets()).toEqual([]);
  });

  it("should deduplicate configuredVehicleTypes and default expressVehicleType for single-type MOTORCYCLE and BIKE lots", () => {
    slotsByParking = {
      "p-moto": [createSlot({ id: "m-1", type: "MOTORCYCLE" })],
      "p-bike": [createSlot({ id: "b-1", type: "BIKE" })],
    };
    ratesByParking = {
      "p-moto": [
        createRate({
          id: "r-m",
          parkingId: "p-moto",
          vehicleType: "MOTORCYCLE",
        }),
      ],
      "p-bike": [
        createRate({ id: "r-b", parkingId: "p-bike", vehicleType: "BIKE" }),
      ],
    };

    const paramMap$ = new BehaviorSubject(
      convertToParamMap({ parkingId: "p-moto" })
    );
    facade.bindRoute(paramMap$);

    expect(facade.configuredVehicleTypes()).toEqual(["MOTORCYCLE"]);
    expect(facade.hasMultipleVehicleTypes()).toBe(false);
    expect(facade.expressVehicleType()).toBe("MOTORCYCLE");

    paramMap$.next(convertToParamMap({ parkingId: "p-bike" }));
    expect(facade.configuredVehicleTypes()).toEqual(["BIKE"]);
    expect(facade.expressVehicleType()).toBe("BIKE");
  });

  it("should ignore stale expressPlate when openCheckInModal(true) is called for unplated vehicles", () => {
    facade.expressPlate.set("ABC-123");
    facade.openCheckInModal(true);

    expect(facade.isCheckInModalOpen()).toBe(true);
    expect(facade.checkInModalInitialUnplated()).toBe(true);
    expect(facade.checkInModalInitialPlate()).toBe("");
  });

  it("should reset expressPlate and modal state and refresh active tickets on closeCheckInModal", () => {
    facade.bindRoute(of(convertToParamMap({ parkingId: "p-1" })));
    ticketServiceSpy.listTicketsByParkingLot.mockClear();

    facade.expressPlate.set("ABC-123");
    facade.openCheckInModal(false, "ABC123", slotsByParking["p-1"][0]);
    facade.closeCheckInModal();

    expect(facade.isCheckInModalOpen()).toBe(false);
    expect(facade.selectedCheckInSlot()).toBeNull();
    expect(facade.checkInModalInitialUnplated()).toBe(false);
    expect(facade.checkInModalInitialPlate()).toBe("");
    expect(facade.expressPlate()).toBe("");
    expect(ticketServiceSpy.listTicketsByParkingLot).toHaveBeenCalledWith(
      "p-1"
    );
  });

  it("should match tickets by exact, unique, and hyphen-normalized queries on submitExpressCheckOutByQuery", () => {
    const tickets = [
      createTicket({ id: "t-1", licensePlate: "ABC-100", slotNumber: "101" }),
      createTicket({ id: "t-2", licensePlate: "ABC-200", slotNumber: "102" }),
      createTicket({ id: "t-3", licensePlate: "EXP123", slotNumber: "105" }),
    ];
    facade.activeTickets.set(tickets);

    // Hyphen-normalized match
    facade.submitExpressCheckOutByQuery("EXP-123");
    expect(facade.selectedCheckoutTicket()?.id).toBe("t-3");
    expect(facade.isCheckOutModalOpen()).toBe(true);

    facade.closeCheckOutModal();

    // Multiple ambiguous matches -> warning toast
    facade.submitExpressCheckOutByQuery("ABC");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Múltiples vehículos coinciden. Selecciona uno de la lista.",
      type: "warning",
    });
    expect(facade.isCheckOutModalOpen()).toBe(false);

    // No match -> error toast
    facade.submitExpressCheckOutByQuery("ZZZZZZ");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "No se encontró ningún vehículo activo con ese criterio.",
      type: "error",
    });
  });

  it("should show error toasts on invalid plate or unavailable slots in submitExpressCheckIn", () => {
    facade.bindRoute(of(convertToParamMap({ parkingId: "p-1" })));

    facade.submitExpressCheckIn("AB", "CAR");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Por favor ingresa una placa válida.",
      type: "error",
    });
    expect(facade.isCheckInModalOpen()).toBe(false);

    toastSpy.showToast.mockClear();
    facade.submitExpressCheckIn("BIK123", "BIKE");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "No hay cupos disponibles para bicicletas.",
      type: "error",
    });
    expect(facade.isCheckInModalOpen()).toBe(false);
  });

  it("should show error toast with fallback message when checkOutSpecificSlot fails", () => {
    ticketServiceSpy.getActiveTicketBySlot.mockReturnValue(
      throwError(() => new Error("Network failure"))
    );

    facade.checkOutSpecificSlot(slotsByParking["p-1"][1]);

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "No se encontró un ticket activo para este cupo.",
      type: "error",
    });
    expect(facade.isCheckOutModalOpen()).toBe(false);
  });

  it("should match active ticket by ticketId or normalized plate on onQrScanned and toast when missing", () => {
    facade.activeTickets.set([
      createTicket({ id: "t-qr-1", licensePlate: "XYZ-789" }),
    ]);

    facade.onQrScanned({ plate: "xyz789" });
    expect(facade.selectedCheckoutTicket()?.id).toBe("t-qr-1");
    expect(facade.isCheckOutModalOpen()).toBe(true);

    facade.closeCheckOutModal();
    facade.onQrScanned({ ticketId: "missing-99999999" });
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Ticket #missing- no encontrado en taquilla o ya fue liquidado.",
      type: "error",
    });
  });
});
