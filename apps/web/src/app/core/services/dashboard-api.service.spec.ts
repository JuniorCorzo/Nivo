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

  it("should pass startDate and endDate to getHourlyOccupancy when provided", () => {
    service
      .getHourlyOccupancy(
        "pkg-123",
        "2026-10-01T00:00:00.000Z",
        "2026-10-01T23:59:59.000Z"
      )
      .subscribe((points) => {
        expect(points.length).toBe(1);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/dashboard/occupancy-hourly") &&
        r.params.get("parkingId") === "pkg-123" &&
        r.params.get("startDate") === "2026-10-01T00:00:00.000Z" &&
        r.params.get("endDate") === "2026-10-01T23:59:59.000Z"
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

  it("should sanitize startDate and endDate to YYYY-MM-DD format in getParkingsComparison", () => {
    service
      .getParkingsComparison(
        "2026-10-01T00:00:00.000Z",
        "2026-10-01T23:59:59.000Z"
      )
      .subscribe((items) => {
        expect(items.length).toBe(1);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/dashboard/parkings-comparison") &&
        r.params.get("startDate") === "2026-10-01" &&
        r.params.get("endDate") === "2026-10-01"
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

  it("should preserve already formatted YYYY-MM-DD startDate and endDate in getParkingsComparison", () => {
    service
      .getParkingsComparison("2026-10-01", "2026-10-02")
      .subscribe((items) => {
        expect(items.length).toBe(1);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url.endsWith("/dashboard/parkings-comparison") &&
        r.params.get("startDate") === "2026-10-01" &&
        r.params.get("endDate") === "2026-10-02"
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

  describe("In-Memory Request Caching", () => {
    it("should return cached summary on repeated calls within TTL without triggering a second HTTP request", () => {
      let call1Result: unknown;
      let call2Result: unknown;

      service.getSummary("pkg-1").subscribe((res) => {
        call1Result = res;
      });

      const req1 = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/summary")
      );
      req1.flush({
        availableSlots: 10,
        occupancyRate: 50,
        occupiedSlots: 10,
        parkingId: "pkg-1",
        scope: "SINGLE",
        todayRevenue: 100_000,
        totalCapacity: 20,
      });

      service.getSummary("pkg-1").subscribe((res) => {
        call2Result = res;
      });

      httpMock.expectNone((r) => r.url.endsWith("/dashboard/summary"));
      expect(call1Result).toEqual(call2Result);
    });

    it("should return cached hourly occupancy on repeated calls within TTL", () => {
      let callCount = 0;
      service
        .getHourlyOccupancy("pkg-1", "2026-10-01", "2026-10-02")
        .subscribe(() => {
          callCount += 1;
        });

      const req = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/occupancy-hourly")
      );
      req.flush([
        {
          checkins: 5,
          checkouts: 2,
          hourBucket: "2026-10-01T10:00:00Z",
          occupancyRate: 50,
          totalCapacity: 100,
        },
      ]);

      service
        .getHourlyOccupancy("pkg-1", "2026-10-01", "2026-10-02")
        .subscribe(() => {
          callCount += 1;
        });

      httpMock.expectNone((r) => r.url.endsWith("/dashboard/occupancy-hourly"));
      expect(callCount).toBe(2);
    });

    it("should return cached hourly occupancy when dates differ only by milliseconds/sub-minute precision", () => {
      let callCount = 0;
      service
        .getHourlyOccupancy(
          "pkg-1",
          "2026-10-01T00:00:00.000Z",
          "2026-10-01T23:59:59.999Z"
        )
        .subscribe(() => {
          callCount += 1;
        });

      const req = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/occupancy-hourly")
      );
      req.flush([
        {
          checkins: 5,
          checkouts: 2,
          hourBucket: "2026-10-01T10:00:00Z",
          occupancyRate: 50,
          totalCapacity: 100,
        },
      ]);

      service
        .getHourlyOccupancy(
          "pkg-1",
          "2026-10-01T00:00:00.123Z",
          "2026-10-01T23:59:59.456Z"
        )
        .subscribe(() => {
          callCount += 1;
        });

      httpMock.expectNone((r) => r.url.endsWith("/dashboard/occupancy-hourly"));
      expect(callCount).toBe(2);
    });

    it("should re-invoke backend service when clearCache is called", () => {
      service.getSummary().subscribe();
      const req1 = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/summary")
      );
      req1.flush({
        availableSlots: 50,
        occupancyRate: 50,
        occupiedSlots: 50,
        scope: "GLOBAL",
        todayRevenue: 200_000,
        totalCapacity: 100,
      });

      service.clearCache();

      service.getSummary().subscribe();
      const req2 = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/summary")
      );
      req2.flush({
        availableSlots: 50,
        occupancyRate: 50,
        occupiedSlots: 50,
        scope: "GLOBAL",
        todayRevenue: 200_000,
        totalCapacity: 100,
      });
    });

    it("should force new network request when TTL expires", () => {
      vi.useFakeTimers();
      try {
        service.getSummary().subscribe();
        const req1 = httpMock.expectOne((r) =>
          r.url.endsWith("/dashboard/summary")
        );
        req1.flush({
          availableSlots: 50,
          occupancyRate: 50,
          occupiedSlots: 50,
          scope: "GLOBAL",
          todayRevenue: 200_000,
          totalCapacity: 100,
        });

        vi.advanceTimersByTime(service.defaultTtlMs + 1000);

        service.getSummary().subscribe();
        const req2 = httpMock.expectOne((r) =>
          r.url.endsWith("/dashboard/summary")
        );
        req2.flush({
          availableSlots: 40,
          occupancyRate: 60,
          occupiedSlots: 60,
          scope: "GLOBAL",
          todayRevenue: 250_000,
          totalCapacity: 100,
        });
      } finally {
        vi.useRealTimers();
      }
    });

    it("should invalidate specific cache patterns", () => {
      service.getSummary("pkg-1").subscribe();
      const req1 = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/summary")
      );
      req1.flush({
        availableSlots: 10,
        occupancyRate: 50,
        occupiedSlots: 10,
        parkingId: "pkg-1",
        scope: "SINGLE",
        todayRevenue: 100_000,
        totalCapacity: 20,
      });

      service.invalidate("summary:pkg-1");

      service.getSummary("pkg-1").subscribe();
      const req2 = httpMock.expectOne((r) =>
        r.url.endsWith("/dashboard/summary")
      );
      req2.flush({
        availableSlots: 10,
        occupancyRate: 50,
        occupiedSlots: 10,
        parkingId: "pkg-1",
        scope: "SINGLE",
        todayRevenue: 100_000,
        totalCapacity: 20,
      });
    });
  });
});
