import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { DashboardSummaryModel } from "@core/models/dashboard.model";
import { DashboardApiService } from "@core/services/dashboard-api.service";
import { DashboardSseService } from "@core/services/dashboard-sse.service";
import { of } from "rxjs";

import { DashboardFacade } from "./dashboard.facade";

interface ApiServiceMock {
  clearCache: ReturnType<typeof vi.fn>;
  exportOperationalReportCsv: ReturnType<typeof vi.fn>;
  getHourlyOccupancy: ReturnType<typeof vi.fn>;
  getOperationalReport: ReturnType<typeof vi.fn>;
  getParkingsComparison: ReturnType<typeof vi.fn>;
  getSummary: ReturnType<typeof vi.fn>;
  setCache: ReturnType<typeof vi.fn>;
}

interface SseServiceMock {
  calculateBackoffDelay: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  handleSseMessage: ReturnType<typeof vi.fn>;
  updates: ReturnType<typeof signal<DashboardSummaryModel | null>>;
}

describe("DashboardFacade", () => {
  let facade: DashboardFacade;
  let apiServiceMock: ApiServiceMock;
  let sseServiceMock: SseServiceMock;

  beforeEach(() => {
    apiServiceMock = {
      clearCache: vi.fn(),
      exportOperationalReportCsv: vi
        .fn()
        .mockReturnValue(of(new Blob(["mock-csv"], { type: "text/csv" }))),
      getHourlyOccupancy: vi.fn().mockReturnValue(of([])),
      getOperationalReport: vi.fn().mockReturnValue(
        of({
          items: [],
          page: 0,
          totalElements: 0,
          totalPages: 1,
        })
      ),
      getParkingsComparison: vi.fn().mockReturnValue(of([])),
      getSummary: vi.fn().mockReturnValue(
        of({
          availableSlots: 50,
          occupancyRate: 50,
          occupiedSlots: 50,
          scope: "GLOBAL",
          todayRevenue: 100_000,
          totalCapacity: 100,
        })
      ),
      setCache: vi.fn(),
    };

    const sseUpdatesSignal = signal<DashboardSummaryModel | null>(null);
    sseServiceMock = {
      calculateBackoffDelay: vi
        .fn()
        .mockImplementation((count = 0) => Math.min(1000 * 2 ** count, 30_000)),
      connect: vi.fn().mockReturnValue(Promise.resolve()),
      disconnect: vi.fn(),
      handleSseMessage: vi.fn().mockImplementation((_event, data: unknown) => {
        /* SAFETY: data payload in tests adheres to DashboardSummaryModel contract */
        sseUpdatesSignal.set(data as DashboardSummaryModel);
      }),
      updates: sseUpdatesSignal,
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: DashboardApiService, useValue: apiServiceMock },
        { provide: DashboardSseService, useValue: sseServiceMock },
      ],
    });

    facade = TestBed.inject(DashboardFacade);
  });

  afterEach(() => {
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
    expect(facade.isGlobalScope()).toBe(true);
    expect(facade.isSingleScope()).toBe(false);
  });

  it("debe auto-configurar modo SINGLE si el tenant solo posee 1 sede", () => {
    facade.accessibleParkings.set([{ id: "1", name: "Sede Única" }]);
    expect(facade.isMultiParkingTenant()).toBe(false);
    expect(facade.activeScope().mode).toBe("SINGLE");
    expect(facade.activeScope().parkingId).toBe("1");
    expect(facade.isSingleScope()).toBe(true);
    expect(facade.isGlobalScope()).toBe(false);
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

    expect(sseServiceMock.handleSseMessage).toHaveBeenCalled();
    expect(facade.summary()?.occupancyRate).toBe(50);
    expect(facade.occupancyPercentage()).toBe(50);
  });

  it("debe delegar el cálculo de retroceso exponencial al SSE service", () => {
    const delay1 = facade.calculateBackoffDelay(0);
    const delay2 = facade.calculateBackoffDelay(1);
    const delay3 = facade.calculateBackoffDelay(2);

    expect(delay1).toBe(1000);
    expect(delay2).toBe(2000);
    expect(delay3).toBe(4000);
    expect(sseServiceMock.calculateBackoffDelay).toHaveBeenCalledWith(2);
  });

  it("debe solicitar summary a DashboardApiService para ámbito GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede 1" },
      { id: "p2", name: "Sede 2" },
    ]);

    facade.loadSummary();

    expect(apiServiceMock.getSummary).toHaveBeenCalledWith(undefined);
    expect(facade.summary()?.totalCapacity).toBe(100);
  });

  it("debe solicitar summary a DashboardApiService con parkingId para ámbito SINGLE", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Única" }]);

    facade.loadSummary();

    expect(apiServiceMock.getSummary).toHaveBeenCalledWith("p1");
  });

  it("debe solicitar occupancy-hourly a DashboardApiService", () => {
    apiServiceMock.getHourlyOccupancy.mockReturnValue(
      of([
        {
          checkins: 5,
          checkouts: 2,
          estimatedOccupancyRate: 25,
          hourBucket: "2026-09-26T10:00:00Z",
          totalCapacity: 100,
        },
      ])
    );

    facade.loadHourlyOccupancy();

    expect(apiServiceMock.getHourlyOccupancy).toHaveBeenCalled();
    expect(facade.hourlyOccupancy().length).toBe(1);
  });

  it("debe solicitar parkings-comparison a DashboardApiService", () => {
    apiServiceMock.getParkingsComparison.mockReturnValue(
      of([
        {
          activeTickets: 5,
          avgStayMinutes: 30,
          occupancyRate: 70,
          occupiedSlots: 70,
          parkingId: "p1",
          parkingName: "Sede 1",
          todayRevenue: 100_000,
          totalSlots: 100,
        },
      ])
    );

    facade.loadParkingsComparison();

    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u),
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u)
    );
    expect(facade.parkingsComparison().length).toBe(1);
  });

  it("debe solicitar reportes operacionales a DashboardApiService", () => {
    apiServiceMock.getOperationalReport.mockReturnValue(
      of({
        items: [
          {
            entryTime: "2026-09-26T08:00:00Z",
            licensePlate: "XYZ-789",
            slotNumber: "A1",
            slotType: "CAR",
            ticketId: "t1",
            ticketStatus: "ACTIVE",
          },
        ],
        page: 0,
        totalElements: 1,
        totalPages: 1,
      })
    );

    facade.loadReports(0);

    expect(apiServiceMock.getOperationalReport).toHaveBeenCalledWith(
      0,
      undefined
    );
    expect(facade.reports().length).toBe(1);
    expect(facade.reports()[0]?.licensePlate).toBe("XYZ-789");
  });

  it("debe solicitar exportación CSV a DashboardApiService", () => {
    facade.exportCsv().subscribe((blob) => {
      expect(blob.type).toBe("text/csv");
    });

    expect(apiServiceMock.exportOperationalReportCsv).toHaveBeenCalledWith(
      undefined
    );
  });

  it("debe delegar conexión SSE hacia DashboardSseService", async () => {
    await facade.connectSse("p1");
    expect(sseServiceMock.connect).toHaveBeenCalledWith("p1");
  });

  it("debe invocar loadParkingsComparison durante loadAll si isGlobalScope es true, incluso con accessibleParkings vacío", () => {
    facade.accessibleParkings.set([]);
    apiServiceMock.getParkingsComparison.mockClear();

    facade.loadAll();

    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalledTimes(1);
  });

  it("debe invocar loadParkingsComparison reactivamente vía effect cuando accessibleParkings se actualiza con múltiples sedes en modo GLOBAL", () => {
    apiServiceMock.getParkingsComparison.mockClear();
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    TestBed.flushEffects();

    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalled();
  });

  it("debe iniciar con timeGranularity en 'today' y calcular rangos de fecha válidos con límites deterministas", () => {
    expect(facade.timeGranularity()).toBe("today");

    const todayRange = facade.calculateDateRange("today");
    expect(todayRange.startDate).toMatch(/T00:00:00\.000Z?$/u);
    expect(todayRange.endDate).toMatch(/T23:59:59\.999Z?$/u);
    expect(todayRange.startLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(todayRange.endLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(new Date(todayRange.startDate).getTime()).toBeLessThanOrEqual(
      new Date(todayRange.endDate).getTime()
    );

    // Determinismo: llamadas repetidas deben devolver exactamente los mismos límites
    const todayRangeRepeat = facade.calculateDateRange("today");
    expect(todayRangeRepeat.startDate).toBe(todayRange.startDate);
    expect(todayRangeRepeat.endDate).toBe(todayRange.endDate);

    const sevenDaysRange = facade.calculateDateRange("7days");
    expect(sevenDaysRange.startDate).toMatch(/T00:00:00\.000Z?$/u);
    expect(sevenDaysRange.endDate).toMatch(/T23:59:59\.999Z?$/u);
    expect(sevenDaysRange.startLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(sevenDaysRange.endLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    const sevenDaysDiffDays =
      (new Date(sevenDaysRange.endDate).getTime() -
        new Date(sevenDaysRange.startDate).getTime()) /
      (24 * 60 * 60 * 1000);
    expect(Math.round(sevenDaysDiffDays)).toBe(8);

    const thirtyDaysRange = facade.calculateDateRange("30days");
    expect(thirtyDaysRange.startDate).toMatch(/T00:00:00\.000Z?$/u);
    expect(thirtyDaysRange.endDate).toMatch(/T23:59:59\.999Z?$/u);
    expect(thirtyDaysRange.startLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(thirtyDaysRange.endLocalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    const thirtyDaysDiffDays =
      (new Date(thirtyDaysRange.endDate).getTime() -
        new Date(thirtyDaysRange.startDate).getTime()) /
      (24 * 60 * 60 * 1000);
    expect(Math.round(thirtyDaysDiffDays)).toBe(31);
  });

  it("debe actualizar timeGranularity y recargar métricas con rango de fechas al invocar setTimeGranularity", () => {
    apiServiceMock.getHourlyOccupancy.mockClear();
    apiServiceMock.getParkingsComparison.mockClear();

    facade.setTimeGranularity("7days");

    expect(facade.timeGranularity()).toBe("7days");
    expect(apiServiceMock.getHourlyOccupancy).toHaveBeenCalledWith(
      undefined,
      expect.any(String),
      expect.any(String)
    );
    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u),
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u)
    );
  });

  it("debe invocar loadHourlyOccupancy y loadParkingsComparison con fechas de granularidad en loadAll", () => {
    apiServiceMock.getHourlyOccupancy.mockClear();
    apiServiceMock.getParkingsComparison.mockClear();

    facade.loadAll();

    expect(apiServiceMock.getHourlyOccupancy).toHaveBeenCalledWith(
      undefined,
      expect.any(String),
      expect.any(String)
    );
    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u),
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u)
    );
  });

  it("debe pasar fechas en formato YYYY-MM-DD a getParkingsComparison incluso si se proporcionan fechas ISO", () => {
    apiServiceMock.getParkingsComparison.mockClear();

    facade.loadParkingsComparison(
      "2026-10-01T05:00:00.000Z",
      "2026-10-01T23:59:59.000Z"
    );

    expect(apiServiceMock.getParkingsComparison).toHaveBeenCalledWith(
      "2026-10-01",
      "2026-10-01"
    );
  });

  it("debe limpiar la caché de DashboardApiService y recargar datos al invocar refreshTelemetry", () => {
    facade.refreshTelemetry();
    expect(apiServiceMock.clearCache).toHaveBeenCalled();
    expect(apiServiceMock.getSummary).toHaveBeenCalled();
  });

  it("debe actualizar la caché de DashboardApiService al recibir actualización SSE de summary", () => {
    facade.handleSseMessage("snapshot", {
      availableSlots: 100,
      currency: "COP",
      occupancyRate: 50,
      occupiedSlots: 100,
      scope: "GLOBAL",
      todayRevenue: 250_000,
      totalCapacity: 200,
    });

    expect(apiServiceMock.setCache).toHaveBeenCalledWith(
      "summary:global",
      expect.objectContaining({ occupancyRate: 50 })
    );
  });

  it("debe actualizar el ámbito y recargar métricas sin reconectar SSE al invocar setScope", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    sseServiceMock.connect.mockClear();
    apiServiceMock.getSummary.mockClear();

    facade.setScope("SINGLE", "p1");

    expect(facade.activeScope()).toEqual({ mode: "SINGLE", parkingId: "p1" });
    expect(sseServiceMock.connect).not.toHaveBeenCalled();
    expect(apiServiceMock.getSummary).toHaveBeenCalledWith("p1");
  });

  it("no debe sobrescribir summary cuando llega actualización SSE de otra sede, pero sí actualizar la caché", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede 1" },
      { id: "p2", name: "Sede 2" },
    ]);
    facade.setScope("SINGLE", "p1");

    const p1Summary: DashboardSummaryModel = {
      availableSlots: 20,
      currency: "COP",
      occupancyRate: 80,
      occupiedSlots: 80,
      parkingId: "p1",
      scope: "SINGLE",
      todayRevenue: 200_000,
      totalCapacity: 100,
    };
    facade.handleSseMessage("snapshot", p1Summary);
    expect(facade.summary()?.parkingId).toBe("p1");
    expect(facade.summary()?.occupancyRate).toBe(80);

    const p2Summary: DashboardSummaryModel = {
      availableSlots: 40,
      currency: "COP",
      occupancyRate: 60,
      occupiedSlots: 60,
      parkingId: "p2",
      scope: "SINGLE",
      todayRevenue: 150_000,
      totalCapacity: 100,
    };
    facade.handleSseMessage("snapshot", p2Summary);

    // El ámbito activo es p1, el summary de la vista no debe cambiar a p2
    expect(facade.summary()?.parkingId).toBe("p1");
    expect(facade.summary()?.occupancyRate).toBe(80);

    // Pero la caché sí debe actualizarse para p2
    expect(apiServiceMock.setCache).toHaveBeenCalledWith(
      "summary:p2",
      p2Summary
    );
  });

  it("no debe sobrescribir summary en ámbito GLOBAL si la actualización SSE es de una sede SINGLE", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede 1" },
      { id: "p2", name: "Sede 2" },
    ]);
    facade.setScope("GLOBAL");

    const globalSummary: DashboardSummaryModel = {
      availableSlots: 100,
      currency: "COP",
      occupancyRate: 50,
      occupiedSlots: 100,
      scope: "GLOBAL",
      todayRevenue: 500_000,
      totalCapacity: 200,
    };
    facade.handleSseMessage("snapshot", globalSummary);
    expect(facade.summary()?.scope).toBe("GLOBAL");

    const p1Summary: DashboardSummaryModel = {
      availableSlots: 10,
      currency: "COP",
      occupancyRate: 90,
      occupiedSlots: 90,
      parkingId: "p1",
      scope: "SINGLE",
      todayRevenue: 250_000,
      totalCapacity: 100,
    };
    facade.handleSseMessage("snapshot", p1Summary);

    expect(facade.summary()?.scope).toBe("GLOBAL");
    expect(facade.summary()?.occupancyRate).toBe(50);
    expect(apiServiceMock.setCache).toHaveBeenCalledWith(
      "summary:p1",
      p1Summary
    );
  });
});
