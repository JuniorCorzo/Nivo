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
import { of } from "rxjs";

import { TicketService } from "./ticket-service";

describe("TicketService", () => {
  let service: TicketService;
  let parkingTicketsSpy: jasmine.SpyObj<ParkingTicketsService>;
  let ratesSpy: jasmine.SpyObj<RatesService>;

  beforeEach(() => {
    parkingTicketsSpy = jasmine.createSpyObj("ParkingTicketsService", [
      "createTicket",
      "getActiveTicket",
      "checkOutVehicle",
    ]);
    ratesSpy = jasmine.createSpyObj("RatesService", ["calculatePrice"]);

    TestBed.configureTestingModule({
      providers: [
        TicketService,
        { provide: ParkingTicketsService, useValue: parkingTicketsSpy },
        { provide: RatesService, useValue: ratesSpy },
      ],
    });

    service = TestBed.inject(TicketService);
  });

  it("should call ParkingTicketsService.createTicket and return mapped TicketSummary", (done) => {
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

    parkingTicketsSpy.createTicket.and.returnValue(of(mockResponse));

    const payload: CreateTicketPayload = {
      plate: "ABC123",
      rateId: "rate-1",
      slotId: "slot-1",
    };

    service.createTicket(payload).subscribe((result) => {
      expect(result.id).toBe("ticket-1");
      expect(result.licensePlate).toBe("ABC123");
      expect(service.activeTickets().length).toBe(1);
      done();
    });
  });

  it("should call RatesService.calculatePrice and return mapped PriceDetailedModel", (done) => {
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

    ratesSpy.calculatePrice.and.returnValue(of(mockResponse));

    service.calculatePrice("ticket-1").subscribe((result) => {
      expect(result.total).toBe(5950);
      expect(result.name).toBe("Tarifa General");
      done();
    });
  });

  it("should call ParkingTicketsService.checkOutVehicle and return mapped PaymentRecord", (done) => {
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

    parkingTicketsSpy.checkOutVehicle.and.returnValue(of(mockResponse));

    const payload: CheckOutPayload = {
      paymentMethod: "EFFECTIVE",
      sendVia: "URL",
      ticketId: "ticket-1",
    };

    service.checkOutVehicle(payload).subscribe((result) => {
      expect(result.id).toBe("payment-1");
      expect(result.amount).toBe(5950);
      done();
    });
  });

  it("should call ParkingTicketsService.getActiveTicket and return mapped TicketSummary", (done) => {
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

    parkingTicketsSpy.getActiveTicket.and.returnValue(of(mockResponse));

    service.getActiveTicketBySlot("slot-1").subscribe((result) => {
      expect(parkingTicketsSpy.getActiveTicket).toHaveBeenCalledWith(
        { slot: "slot-1" },
        jasmine.any(Object)
      );
      expect(result.id).toBe("ticket-real-123");
      expect(result.licensePlate).toBe("XYZ789");
      expect(result.slotId).toBe("slot-1");
      done();
    });
  });
});
