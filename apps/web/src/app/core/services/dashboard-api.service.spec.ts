import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AUTHORIZED } from "@core/http/context/auth.token";

import { DashboardApiService } from "./dashboard-api.service";

describe("DashboardApiService", () => {
  let service: DashboardApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DashboardApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should get summary for global scope with AUTHORIZED context and mapped model", () => {
    service.getSummary().subscribe((summary) => {
      expect(summary.totalCapacity).toBe(200);
      expect(summary.occupancyRate).toBe(50);
      expect(summary.scope).toBe("GLOBAL");
    });

    const req = httpMock.expectOne((r) => r.url.endsWith("/dashboard/summary"));
    expect(req.request.method).toBe("GET");
    expect(req.request.context.get(AUTHORIZED)).toBe(true);
    expect(req.request.params.has("parkingId")).toBe(false);

    req.flush({
      availableSlots: 100,
      occupancyRate: 50,
      occupiedSlots: 100,
      scope: "GLOBAL",
      todayRevenue: 500_000,
      totalCapacity: 200,
    });
  });

  it("should get summary for single parking scope with parkingId param", () => {
    service.getSummary("pkg-123").subscribe((summary) => {
      expect(summary.parkingId).toBe("pkg-123");
      expect(summary.occupancyRate).toBe(75);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/dashboard/summary") &&
        r.params.get("parkingId") === "pkg-123"
    );
    expect(req.request.method).toBe("GET");
    expect(req.request.context.get(AUTHORIZED)).toBe(true);

    req.flush({
      availableSlots: 25,
      occupancyRate: 75,
      occupiedSlots: 75,
      parkingId: "pkg-123",
      scope: "SINGLE",
      todayRevenue: 200_000,
      totalCapacity: 100,
    });
  });

  it("should get hourly occupancy and map to domain model array", () => {
    service.getHourlyOccupancy("pkg-123").subscribe((points) => {
      expect(points.length).toBe(1);
      expect(points[0]?.estimatedOccupancyRate).toBe(45);
      expect(points[0]?.checkins).toBe(10);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/dashboard/occupancy-hourly") &&
        r.params.get("parkingId") === "pkg-123"
    );
    expect(req.request.context.get(AUTHORIZED)).toBe(true);

    req.flush([
      {
        checkins: 10,
        checkouts: 5,
        hourBucket: "2026-09-26T14:00:00Z",
        occupancyRate: 45,
        totalCapacity: 100,
      },
    ]);
  });

  it("should get parkings comparison and map items", () => {
    service.getParkingsComparison().subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0]?.parkingName).toBe("Sede Norte");
      expect(items[0]?.occupancyRate).toBe(85);
    });

    const req = httpMock.expectOne((r) =>
      r.url.endsWith("/dashboard/parkings-comparison")
    );
    expect(req.request.context.get(AUTHORIZED)).toBe(true);

    req.flush([
      {
        occupancyRate: 85,
        occupiedSlots: 85,
        parkingId: "p-1",
        parkingName: "Sede Norte",
        todayRevenue: 1_200_000,
        totalSlots: 100,
      },
    ]);
  });

  it("should get operational report with pageable and return paginated model", () => {
    service.getOperationalReport(1, "pkg-123").subscribe((report) => {
      expect(report.page).toBe(1);
      expect(report.totalPages).toBe(5);
      expect(report.items.length).toBe(1);
      expect(report.items[0]?.licensePlate).toBe("ABC1234");
    });

    const req = httpMock.expectOne((r) =>
      r.url.endsWith("/reports/operational")
    );
    expect(req.request.context.get(AUTHORIZED)).toBe(true);
    expect(req.request.params.get("parkingId")).toBe("pkg-123");

    req.flush({
      content: [
        {
          entryTime: "2026-09-26T08:00:00Z",
          licensePlate: "ABC1234",
          slotNumber: "10",
          slotType: "CAR",
          ticketId: "tk-1",
          ticketStatus: "CLOSED",
        },
      ],
      number: 1,
      totalElements: 50,
      totalPages: 5,
    });
  });

  it("should export CSV as Blob with AUTHORIZED context", () => {
    service.exportOperationalReportCsv("pkg-123").subscribe((blob) => {
      expect(blob).toBeTruthy();
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/reports/operational/csv") &&
        r.params.get("parkingId") === "pkg-123"
    );
    expect(req.request.method).toBe("GET");
    expect(req.request.responseType).toBe("blob");
    expect(req.request.context.get(AUTHORIZED)).toBe(true);

    req.flush(new Blob(["Ticket ID,Placa\n1,ABC1234"], { type: "text/csv" }));
  });
});
