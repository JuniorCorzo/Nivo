import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { PublicTicketService } from "./public-ticket.service";

describe("PublicTicketService", () => {
  let service: PublicTicketService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicTicketService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PublicTicketService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should request public ticket by id via GET /api/public/tickets/{id}", () => {
    const mockTicket = {
      entryTime: "2026-10-14T01:00:00Z",
      id: "ticket-uuid-1",
      parkingLotName: "Parqueadero Central",
      photoUrl: "data:image/jpeg;base64,mock",
      plate: "SP-1001",
      plateCountry: "UNPLATED",
      rateName: "Tarifa Moto",
      ratePricePerUnit: 2000,
      rateTimeUnit: "HOURS",
      slotNumber: "M-01",
      status: "OPEN",
    };

    service.getPublicTicket("ticket-uuid-1").subscribe((ticket) => {
      expect(ticket).toEqual(mockTicket);
      expect(ticket.plate).toBe("SP-1001");
      expect(ticket.plateCountry).toBe("UNPLATED");
    });

    const req = httpTesting.expectOne("/api/public/tickets/ticket-uuid-1");
    expect(req.request.method).toBe("GET");
    req.flush(mockTicket);
  });
});
