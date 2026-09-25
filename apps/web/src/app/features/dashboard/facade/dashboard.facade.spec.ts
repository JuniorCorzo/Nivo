import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { DashboardFacade } from "./dashboard.facade";

describe("DashboardFacade", () => {
  let facade: DashboardFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    facade = TestBed.inject(DashboardFacade);
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
      scope: "GLOBAL",
      totalCapacity: 200,
      occupiedSlots: 100,
      availableSlots: 100,
      occupancyRate: 50.0,
      todayRevenue: 250000,
      currency: "COP",
    });

    expect(facade.summary()?.occupancyRate).toBe(50.0);
    expect(facade.occupancyPercentage()).toBe(50.0);
  });

  it("debe activar retroceso exponencial en reconexión ante fallo de red SSE", () => {
    const delay1 = facade.calculateBackoffDelay(0);
    const delay2 = facade.calculateBackoffDelay(1);
    const delay3 = facade.calculateBackoffDelay(2);

    expect(delay1).toBe(1000); // 1s
    expect(delay2).toBe(2000); // 2s
    expect(delay3).toBe(4000); // 4s
  });
});
