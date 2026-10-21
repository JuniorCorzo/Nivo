import { TestBed } from "@angular/core/testing";
import type {
  ResponseParkingTicketsDto,
  ResponsePaymentsDto,
  ResponsePriceDetailed,
} from "@core/api/generated/models";
import {
  ParkingTicketsService,
  RatesService,
} from "@core/api/generated/services";
import type {
  CreateTicketPayload,
  CheckOutPayload,
} from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { firstValueFrom, of, throwError } from "rxjs";

import { TicketService } from "./ticket-service";

interface MockParkingTicketsService {
  checkOutVehicle: ReturnType<typeof vi.fn>;
  createTicket: ReturnType<typeof vi.fn>;
  getActiveTicket: ReturnType<typeof vi.fn>;
  listTickets: ReturnType<typeof vi.fn>;
}

interface MockRatesService {
  calculatePrice: ReturnType<typeof vi.fn>;
}

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
}

describe("TicketService", () => {
  let service: TicketService;
  let parkingTicketsSpy: MockParkingTicketsService;
  let ratesSpy: MockRatesService;
  let parkingSpy: MockParkingService;

  beforeEach(() => {
    parkingTicketsSpy = {
      checkOutVehicle: vi.fn(),
      createTicket: vi.fn(),
      getActiveTicket: vi.fn(),
      listTickets: vi.fn(),
    };
    ratesSpy = {
      calculatePrice: vi.fn(),
    };
    parkingSpy = {
      getAll: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TicketService,
        { provide: ParkingTicketsService, useValue: parkingTicketsSpy },
        { provide: RatesService, useValue: ratesSpy },
        { provide: ParkingService, useValue: parkingSpy },
      ],
    });

    service = TestBed.inject(TicketService);
  });

  it("should call ParkingTicketsService.createTicket and return mapped TicketSummary", async () => {
    const mockResponse: ResponseParkingTicketsDto = {
      data: {
        entryTime: "2026-08-27T10:00:00Z",
        id: "ticket-1",
        licensePlate: "ABC123",
        status: "OPEN",
        user: {
          contactInfo: "123",
          email: "op@test.com",
          fullName: "Operator",
          id: "u-1",
          role: "OPERATOR",
        },
      },
      message: "Created",
      status: "201",
      timestamp: "2026-08-27T10:00:00Z",
    };

    parkingTicketsSpy.createTicket.mockReturnValue(of(mockResponse));

    const payload: CreateTicketPayload = {
      plate: "ABC123",
      rateId: "rate-1",
      slotId: "slot-1",
    };

    const result = await firstValueFrom(service.createTicket(payload));
    expect(result.id).toBe("ticket-1");
    expect(result.licensePlate).toBe("ABC123");
    expect(service.activeTickets().length).toBe(1);
  });

  it("should call RatesService.calculatePrice and return mapped PriceDetailedModel", async () => {
    const mockResponse: ResponsePriceDetailed = {
      data: {
        breakpoint: [],
        ivaAmount: 950,
        ivaRate: 19,
        name: "Tarifa General",
        subtotal: 5000,
        total: 5950,
      },
      message: "OK",
      status: "200",
      timestamp: "2026-08-27T10:00:00Z",
    };

    ratesSpy.calculatePrice.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(service.calculatePrice("ticket-1"));
    expect(result.total).toBe(5950);
    expect(result.name).toBe("Tarifa General");
  });

  it("should call ParkingTicketsService.checkOutVehicle and return mapped PaymentRecord", async () => {
    const mockResponse: ResponsePaymentsDto = {
      data: {
        amount: 5950,
        id: "payment-1",
        paymentMethod: "EFFECTIVE",
        status: "PAID",
      },
      message: "Paid",
      status: "201",
      timestamp: "2026-08-27T10:00:00Z",
    };

    parkingTicketsSpy.checkOutVehicle.mockReturnValue(of(mockResponse));

    const payload: CheckOutPayload = {
      paymentMethod: "EFFECTIVE",
      sendVia: "URL",
      ticketId: "ticket-1",
    };

    const result = await firstValueFrom(service.checkOutVehicle(payload));
    expect(result.id).toBe("payment-1");
    expect(result.amount).toBe(5950);
  });

  it("should call ParkingTicketsService.getActiveTicket and return mapped TicketSummary", async () => {
    const mockResponse: ResponseParkingTicketsDto = {
      data: {
        entryTime: "2026-08-27T10:00:00Z",
        id: "ticket-real-123",
        licensePlate: "XYZ789",
        slot: {
          id: "slot-1",
          slotNumber: "101",
          status: "OCCUPIED",
          type: "CAR",
        },
        status: "OPEN",
        user: {
          contactInfo: "123",
          email: "op@test.com",
          fullName: "Operator",
          id: "u-1",
          role: "OPERATOR",
        },
      },
      message: "Found",
      status: "200",
      timestamp: "2026-08-27T10:00:00Z",
    };

    parkingTicketsSpy.getActiveTicket.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(
      service.getActiveTicketBySlot("slot-1")
    );
    expect(parkingTicketsSpy.getActiveTicket).toHaveBeenCalledWith(
      { slot: "slot-1" },
      expect.any(Object)
    );
    expect(result.id).toBe("ticket-real-123");
    expect(result.licensePlate).toBe("XYZ789");
    expect(result.slotId).toBe("slot-1");
  });

  it("should call ParkingTicketsService.listTickets and return mapped TicketSummary array", async () => {
    const mockResponse = {
      data: [
        {
          entryTime: "2026-08-27T10:00:00Z",
          id: "ticket-1",
          licensePlate: "ABC123",
          status: "OPEN",
        },
        {
          entryTime: "2026-08-27T08:00:00Z",
          exitTime: "2026-08-27T09:30:00Z",
          id: "ticket-2",
          licensePlate: "XYZ789",
          status: "CLOSED",
          totalToCharge: 5000,
        },
      ],
      message: "OK",
      status: "200",
      timestamp: "2026-08-27T10:00:00Z",
    };

    parkingTicketsSpy.listTickets.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(
      service.listTicketsByParkingLot("lot-1")
    );
    expect(parkingTicketsSpy.listTickets).toHaveBeenCalledWith(
      { parking: "lot-1" },
      expect.anything()
    );
    expect(result.length).toBe(2);
    expect(result[0].id).toBe("ticket-1");
    expect(result[1].id).toBe("ticket-2");
  });

  describe("listTicketsByTenant", () => {
    it("should return empty array when parking lots are empty or null", async () => {
      parkingSpy.getAll.mockReturnValue(of([]));

      const result = await firstValueFrom(service.listTicketsByTenant());
      expect(result).toEqual([]);
      expect(parkingTicketsSpy.listTickets).not.toHaveBeenCalled();
    });

    it("should fetch tickets for each lot, enrich with lot data, and sort descending by entryTime", async () => {
      parkingSpy.getAll.mockReturnValue(
        of([
          { id: "lot-1", name: "Parqueadero Central" },
          { id: "lot-2", name: "Parqueadero Norte" },
        ])
      );

      parkingTicketsSpy.listTickets.mockImplementation(
        (params: { parking: string }) => {
          if (params.parking === "lot-1") {
            return of({
              data: [
                {
                  entryTime: "2026-08-27T10:00:00Z",
                  id: "t-1",
                  licensePlate: "AAA111",
                  status: "OPEN",
                },
              ],
            });
          }
          return of({
            data: [
              {
                entryTime: "2026-08-27T14:00:00Z",
                id: "t-2",
                licensePlate: "BBB222",
                status: "CLOSED",
              },
              {
                createdAt: "2026-08-27T08:00:00Z",
                id: "t-3",
                licensePlate: "CCC333",
                status: "OPEN",
              },
            ],
          });
        }
      );

      const result = await firstValueFrom(service.listTicketsByTenant());

      expect(result.length).toBe(3);
      // t-2 is 14:00 (latest)
      expect(result[0].id).toBe("t-2");
      expect(result[0].parkingLotId).toBe("lot-2");
      expect(result[0].parkingLotName).toBe("Parqueadero Norte");

      // t-1 is 10:00
      expect(result[1].id).toBe("t-1");
      expect(result[1].parkingLotId).toBe("lot-1");
      expect(result[1].parkingLotName).toBe("Parqueadero Central");

      // t-3 is 08:00
      expect(result[2].id).toBe("t-3");
      expect(result[2].parkingLotId).toBe("lot-2");
      expect(result[2].parkingLotName).toBe("Parqueadero Norte");
    });

    it("should gracefully handle errors in individual parking lot ticket requests", async () => {
      parkingSpy.getAll.mockReturnValue(
        of([
          { id: "lot-1", name: "Parqueadero Central" },
          { id: "lot-broken", name: "Parqueadero Error" },
        ])
      );

      parkingTicketsSpy.listTickets.mockImplementation(
        (params: { parking: string }) => {
          if (params.parking === "lot-1") {
            return of({
              data: [
                {
                  entryTime: "2026-08-27T10:00:00Z",
                  id: "t-1",
                  licensePlate: "AAA111",
                  status: "OPEN",
                },
              ],
            });
          }
          return throwError(() => new Error("Network error"));
        }
      );

      const result = await firstValueFrom(service.listTicketsByTenant());

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("t-1");
      expect(result[0].parkingLotId).toBe("lot-1");
    });
  });
});
