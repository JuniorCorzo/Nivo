import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { DashboardFacade } from "./dashboard.facade";

describe("DashboardFacade", () => {
  let facade: DashboardFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    facade = TestBed.inject(DashboardFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    facade.disconnect();
    TestBed.resetTestingModule();
  });

  it("debe detectar automáticamente tenant multi-sede si accessibleParkings > 1 y activar GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "1", name: "Sede Centro" },
      { id: "2", name: "Sede Norte" },
    ]);
    expect(facade.isMultiParkingTenant()).toBe(true);
    expect(facade.activeScope().mode).toBe("GLOBAL");
  });

  it("debe auto-configurar modo SINGLE si el tenant solo posee 1 sede", () => {
    facade.accessibleParkings.set([{ id: "1", name: "Sede Única" }]);
    expect(facade.isMultiParkingTenant()).toBe(false);
    expect(facade.activeScope().mode).toBe("SINGLE");
  });

  it("debe procesar eventos SSE y actualizar Signals reactivamente", () => {
    facade.handleSseMessage("snapshot", {
      availableSlots: 100,
      currency: "COP",
      occupancyRate: 50,
      occupiedSlots: 100,
      scope: "GLOBAL",
      todayRevenue: 250_000,
      totalCapacity: 200,
    });

    expect(facade.summary()?.occupancyRate).toBe(50);
    expect(facade.occupancyPercentage()).toBe(50);
  });

  it("debe activar retroceso exponencial en reconexión ante fallo de red SSE", () => {
    const delay1 = facade.calculateBackoffDelay(0);
    const delay2 = facade.calculateBackoffDelay(1);
    const delay3 = facade.calculateBackoffDelay(2);

    /* 1s */
    expect(delay1).toBe(1000);
    /* 2s */
    expect(delay2).toBe(2000);
    /* 4s */
    expect(delay3).toBe(4000);
  });

  it("debe solicitar summary en /api/dashboard/summary para ámbito GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede 1" },
      { id: "p2", name: "Sede 2" },
    ]);

    facade.loadSummary();

    const req = httpMock.expectOne("/api/dashboard/summary");
    expect(req.request.method).toBe("GET");
    req.flush({
      availableSlots: 50,
      currency: "COP",
      occupancyRate: 75,
      occupiedSlots: 150,
      scope: "GLOBAL",
      todayRevenue: 300_000,
      totalCapacity: 200,
    });

    expect(facade.summary()?.totalCapacity).toBe(200);
  });

  it("debe solicitar summary en /api/dashboard/summary?parkingId=... para ámbito SINGLE", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Única" }]);

    facade.loadSummary();

    const req = httpMock.expectOne("/api/dashboard/summary?parkingId=p1");
    expect(req.request.method).toBe("GET");
    req.flush({
      availableSlots: 20,
      currency: "COP",
      occupancyRate: 80,
      occupiedSlots: 80,
      parkingId: "p1",
      scope: "SINGLE",
      todayRevenue: 120_000,
      totalCapacity: 100,
    });

    expect(facade.summary()?.parkingId).toBe("p1");
  });

  it("debe solicitar occupancy-hourly en /api/dashboard/occupancy-hourly", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede 1" },
      { id: "p2", name: "Sede 2" },
    ]);

    facade.loadHourlyOccupancy();

    const req = httpMock.expectOne("/api/dashboard/occupancy-hourly");
    expect(req.request.method).toBe("GET");
    req.flush([
      { checkins: 5, checkouts: 2, hourBucket: "2026-09-26T10:00:00Z", occupancyRate: 25, totalCapacity: 100 },
    ]);

    expect(facade.hourlyOccupancy().length).toBe(1);
  });

  it("debe solicitar parkings-comparison en /api/dashboard/parkings-comparison", () => {
    facade.loadParkingsComparison();

    const req = httpMock.expectOne("/api/dashboard/parkings-comparison");
    expect(req.request.method).toBe("GET");
    req.flush([
      { occupancyRate: 70, parkingId: "p1", parkingName: "Sede 1", todayRevenue: 100000 },
    ]);

    expect(facade.parkingsComparison().length).toBe(1);
  });

  it("debe solicitar reportes operacionales en /api/reports/operational", () => {
    facade.loadReports(0);

    const req = httpMock.expectOne("/api/reports/operational?page=0");
    expect(req.request.method).toBe("GET");
    req.flush({
      content: [
        {
          entryTime: "2026-09-26T08:00:00Z",
          licensePlate: "XYZ-789",
          slotNumber: "A1",
          slotType: "CAR",
          ticketId: "t1",
          ticketStatus: "ACTIVE",
        },
      ],
      number: 0,
      totalPages: 1,
    });

    expect(facade.reports().length).toBe(1);
    expect(facade.reports()[0]?.licensePlate).toBe("XYZ-789");
  });

  it("debe solicitar exportación CSV en /api/reports/operational/csv", () => {
    facade.exportCsv().subscribe((blob) => {
      expect(blob.type).toBe("text/csv");
    });

    const req = httpMock.expectOne("/api/reports/operational/csv");
    expect(req.request.method).toBe("GET");
    req.flush(new Blob(["Ticket ID,Placa\n"], { type: "text/csv" }));
  });

  it("debe conectar SSE hacia /api/dashboard/stream", async () => {
    const originalFetch = window.fetch;
    let requestedUrl = "";

    window.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      requestedUrl = url.toString();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.close();
        },
      });
      return Promise.resolve(new Response(mockStream, { status: 200 }));
    });

    try {
      await facade.connectSse();
      expect(requestedUrl).toBe("/api/dashboard/stream");
    } finally {
      window.fetch = originalFetch;
    }
  });
});
