import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type {
  PriceDetailedModel,
  TicketSummary,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { TicketService } from "@core/services/ticket-service";
import { of } from "rxjs";

import { TicketsFacade } from "./tickets.facade";

interface MockTicketService {
  calculatePrice: ReturnType<typeof vi.fn>;
  listTicketsByParkingLot: ReturnType<typeof vi.fn>;
  listTicketsByTenant: ReturnType<typeof vi.fn>;
}

interface MockParkingService {
  parkingLots: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
}

describe("TicketsFacade", () => {
  let facade: TicketsFacade;
  let mockTicketService: MockTicketService;
  let mockParkingService: MockParkingService;

  const sampleTickets: TicketSummary[] = [
    {
      entryTime: "2026-09-05T10:00:00Z",
      id: "t-1",
      licensePlate: "ABC123",
      parkingLotId: "lot-1",
      parkingLotName: "Parqueadero Central",
      slotNumber: "A-01",
      slotType: "CAR",
      status: "OPEN",
    },
    {
      entryTime: "2026-09-05T08:00:00Z",
      exitTime: "2026-09-05T09:30:00Z",
      id: "t-2",
      licensePlate: "XYZ789",
      parkingLotId: "lot-2",
      parkingLotName: "Parqueadero Norte",
      slotNumber: "M-05",
      slotType: "MOTORCYCLE",
      status: "CLOSED",
      totalToCharge: 3500,
    },
    {
      entryTime: "2026-09-05T07:00:00Z",
      exitTime: "2026-09-05T11:00:00Z",
      id: "t-3",
      licensePlate: "ABC999",
      parkingLotId: "lot-1",
      parkingLotName: "Parqueadero Central",
      slotNumber: "A-02",
      slotType: "CAR",
      status: "CLOSED",
      totalToCharge: 8000,
    },
  ];

  beforeEach(() => {
    mockTicketService = {
      calculatePrice: vi.fn().mockReturnValue(of(null)),
      listTicketsByParkingLot: vi.fn().mockReturnValue(of(sampleTickets)),
      listTicketsByTenant: vi.fn().mockReturnValue(of(sampleTickets)),
    };
    mockParkingService = {
      parkingLots: signal([]),
    };

    TestBed.configureTestingModule({
      providers: [
        TicketsFacade,
        { provide: TicketService, useValue: mockTicketService },
        { provide: ParkingService, useValue: mockParkingService },
      ],
    });

    facade = TestBed.inject(TicketsFacade);
  });

  it("should load tickets and compute stats reactively", () => {
    facade.loadTickets("parking-123");
    expect(mockTicketService.listTicketsByParkingLot).toHaveBeenCalledWith(
      "parking-123"
    );
    expect(facade.tickets().length).toBe(3);
    expect(facade.isLoading()).toBe(false);

    const stats = facade.ticketStats();
    expect(stats.total).toBe(3);
    expect(stats.open).toBe(1);
    expect(stats.closed).toBe(2);
  });

  it("should filter tickets by license plate substring (case-insensitive)", () => {
    facade.loadTickets("parking-123");
    facade.updateFilters({ plate: "abc" });

    const filtered = facade.filteredTickets();
    expect(filtered.length).toBe(2);
    expect(filtered.every((t) => t.licensePlate.includes("ABC"))).toBe(true);
  });

  it("should filter tickets by status and vehicle type", () => {
    facade.loadTickets("parking-123");
    facade.updateFilters({ status: "CLOSED", vehicleType: "CAR" });

    const filtered = facade.filteredTickets();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("t-3");
  });

  it("should reset filters to initial criteria", () => {
    facade.loadTickets("parking-123");
    facade.updateFilters({ plate: "ABC", status: "OPEN" });
    expect(facade.filteredTickets().length).toBe(1);

    facade.resetFilters();
    expect(facade.filters().plate).toBe("");
    expect(facade.filters().status).toBe("ALL");
    expect(facade.filteredTickets().length).toBe(3);
  });

  it("should trigger calculatePrice when opening detail for an OPEN ticket", () => {
    const mockPrice: PriceDetailedModel = {
      breakdown: [{ amount: 2000, concept: "1 hora" }],
      ivaAmount: 380,
      ivaRate: 19,
      name: "Tarifa Carro",
      subtotal: 2000,
      total: 2380,
    };
    mockTicketService.calculatePrice.mockReturnValue(of(mockPrice));

    facade.openDetail(sampleTickets[0]);

    expect(facade.selectedTicket()).toEqual(sampleTickets[0]);
    expect(facade.isDrawerOpen()).toBe(true);
    expect(mockTicketService.calculatePrice).toHaveBeenCalledWith("t-1");
    expect(facade.liveRatePreview()).toEqual(mockPrice);
  });

  it("should NOT calculate price when opening detail for a CLOSED ticket", () => {
    facade.openDetail(sampleTickets[1]);

    expect(facade.selectedTicket()).toEqual(sampleTickets[1]);
    expect(facade.isDrawerOpen()).toBe(true);
    expect(mockTicketService.calculatePrice).not.toHaveBeenCalled();
    expect(facade.liveRatePreview()).toBeNull();
  });

  it("should close drawer and clear rate preview", () => {
    facade.openDetail(sampleTickets[0]);
    facade.closeDetail();

    expect(facade.isDrawerOpen()).toBe(false);
    expect(facade.selectedTicket()).toBeNull();
    expect(facade.liveRatePreview()).toBeNull();
  });

  it("should manage receipt modal state", () => {
    facade.openReceipt(sampleTickets[0]);
    expect(facade.isReceiptOpen()).toBe(true);
    expect(facade.selectedTicket()).toEqual(sampleTickets[0]);

    facade.closeReceipt();
    expect(facade.isReceiptOpen()).toBe(false);
  });

  it("should load tenant tickets when no parkingId is provided", () => {
    facade.loadTickets();
    expect(mockTicketService.listTicketsByTenant).toHaveBeenCalled();
    expect(facade.isTenantView()).toBe(true);
    expect(facade.tickets().length).toBe(3);
  });

  it("should filter tickets by parkingLotId", () => {
    facade.loadTickets();
    facade.updateFilters({ parkingLotId: "lot-2" });

    const filtered = facade.filteredTickets();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("t-2");
    expect(filtered[0].parkingLotId).toBe("lot-2");
  });
});
