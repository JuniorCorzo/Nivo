import { GlobalWindow } from "happy-dom";

const happyWindow = new GlobalWindow();
(globalThis as any).window = happyWindow;
(globalThis as any).document = happyWindow.document;

import "@angular/compiler";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing";

import { PublicTicketService } from "./public-ticket.service";

try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch {
  // Already initialized
}

describe("PublicTicketService", () => {
  let service: PublicTicketService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
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

  it("should unwrap data property when response wraps ticket in data field", () => {
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

    const apiResponse = {
      status: "200 OK",
      message: "Public ticket retrieved successfully",
      data: mockTicket,
    };

    service.getPublicTicket("ticket-uuid-1").subscribe((ticket) => {
      expect(ticket).toEqual(mockTicket as any);
      expect(ticket.plate).toBe("SP-1001");
      expect(ticket.plateCountry).toBe("UNPLATED");
    });

    const req = httpTesting.expectOne("/api/public/tickets/ticket-uuid-1");
    expect(req.request.method).toBe("GET");
    req.flush(apiResponse);
  });

  it("should handle raw response when data property is absent", () => {
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
      expect(ticket).toEqual(mockTicket as any);
      expect(ticket.plate).toBe("SP-1001");
      expect(ticket.plateCountry).toBe("UNPLATED");
    });

    const req = httpTesting.expectOne("/api/public/tickets/ticket-uuid-1");
    expect(req.request.method).toBe("GET");
    req.flush(mockTicket);
  });
});
