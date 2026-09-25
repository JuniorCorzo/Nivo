import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

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
});
