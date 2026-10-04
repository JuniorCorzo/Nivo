import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { DashboardSseService } from "@core/services/dashboard-sse.service";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardFacade } from "../facade/dashboard.facade";
import { DashboardPage } from "./dashboard-page";

describe("DashboardPage", () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let facade: DashboardFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        DashboardFacade,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    const sseService = TestBed.inject(DashboardSseService);
    vi.spyOn(sseService, "connect").mockReturnValue(Promise.resolve());

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    facade = TestBed.inject(DashboardFacade);
  });

  it("con 1 sola sede debe renderizar vista limpia sin selector multi-sede", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Única" }]);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeNull();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeNull();
  });

  it("con múltiples sedes debe renderizar selector con opción Todas las Sedes y gráfico comparativo en modo GLOBAL dentro de nv-card", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    facade.activeScope.set({ mode: "GLOBAL" });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeTruthy();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeTruthy();
    expect(compiled.textContent).toContain("Comparativa de Sedes");
    expect(
      compiled.querySelector('ng-icon[name="lucideBuilding2"]')
    ).toBeTruthy();
  });

  it("debe envolver los gráficos de tendencia y distribución en contenedores nv-card con encabezados", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Tendencia de Ocupación");
    expect(compiled.textContent).toContain("Distribución de Plazas");
  });

  it("debe renderizar iconos Lucide en las tarjetas de KPI", () => {
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('ng-icon[name="lucideTrendingUp"]')
    ).toBeTruthy();
    expect(
      compiled.querySelector('ng-icon[name="lucideDollarSign"]')
    ).toBeTruthy();
    expect(compiled.querySelector('ng-icon[name="lucideTicket"]')).toBeTruthy();
    expect(compiled.querySelector('ng-icon[name="lucideClock"]')).toBeTruthy();
  });

  it("debe utilizar exclusivamente componentes del @nivo-sass/design-system (cero raw buttons)", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const rawButtons = compiled.querySelectorAll("button:not([nv-button])");
    expect(rawButtons.length).toBe(0);
  });

  it("debe renderizar micro-estadísticas del bento grid ejecutivo (ratio digital, rotación, reloj)", () => {
    facade.summary.set({
      activeTickets: 42,
      availableSlots: 58,
      avgStayMinutes: 95.3,
      completedTickets: 120,
      currency: "COP",
      occupancyRate: 42,
      occupiedSlots: 42,
      scope: "GLOBAL",
      todayRevenue: 1_250_000,
      totalCapacity: 100,
      totalTickets: 162,
    });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.title);
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.kpis.title);
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.revenue.digitalRatio
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.tickets.rotation
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.stay.gracePeriod
    );
    expect(compiled.textContent).toContain("95 min");
    expect(compiled.textContent).toContain("~1h 35m");
  });

  it("debe aplicar clase de color de umbral en barra de progreso de ocupación según el porcentaje", () => {
    facade.summary.set({
      availableSlots: 60,
      occupancyRate: 40,
      occupiedSlots: 40,
      scope: "GLOBAL",
      todayRevenue: 500_000,
      totalCapacity: 100,
    });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector(".bg-emerald-500")).toBeTruthy();

    facade.summary.set({
      availableSlots: 25,
      occupancyRate: 75,
      occupiedSlots: 75,
      scope: "GLOBAL",
      todayRevenue: 800_000,
      totalCapacity: 100,
    });
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-amber-500")).toBeTruthy();

    facade.summary.set({
      availableSlots: 5,
      occupancyRate: 95,
      occupiedSlots: 95,
      scope: "GLOBAL",
      todayRevenue: 1_500_000,
      totalCapacity: 100,
    });
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-rose-500")).toBeTruthy();
  });

  it("debe renderizar el contenedor del header en flujo estático sin clase sticky top-0", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const stickyContainer = compiled.querySelector(".sticky.top-0");
    expect(stickyContainer).toBeNull();
    expect(compiled.querySelector(".flex.flex-col.gap-4")).toBeTruthy();
  });

  it("debe mostrar el nombre de la sede en el título de KPI cuando una sola sede está seleccionada", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Kennedy" }]);
    facade.activeScope.set({ mode: "SINGLE", parkingId: "p1" });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Sede Kennedy");
  });

  it("debe renderizar la insignia En línea con animación de pulso y no texto plano", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.kpis.liveStatus);
    expect(compiled.textContent).not.toContain("Sincronizado en tiempo real");
    expect(compiled.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("debe renderizar los botones de filtro de granularidad temporal con nv-button y permitir alternar estado", () => {
    const setGranularitySpy = vi.spyOn(facade, "setTimeGranularity");
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const filter = compiled.querySelector(
      '[data-testid="time-granularity-filter"]'
    );
    expect(filter).toBeTruthy();

    /* SAFETY: Test element query returns HTMLElement */
    const btnToday = compiled.querySelector(
      '[data-testid="granularity-today"]'
    ) as HTMLElement;
    /* SAFETY: Test element query returns HTMLElement */
    const btnWeek = compiled.querySelector(
      '[data-testid="granularity-week"]'
    ) as HTMLElement;
    /* SAFETY: Test element query returns HTMLElement */
    const btnMonth = compiled.querySelector(
      '[data-testid="granularity-month"]'
    ) as HTMLElement;

    expect(btnToday).toBeTruthy();
    expect(btnWeek).toBeTruthy();
    expect(btnMonth).toBeTruthy();
    expect(btnToday.getAttribute("nv-button")).toBeDefined();

    expect(component.timeGranularity()).toBe("today");

    btnWeek.click();
    fixture.detectChanges();
    expect(setGranularitySpy).toHaveBeenCalledWith("7days");
    expect(component.timeGranularity()).toBe("7days");

    btnMonth.click();
    fixture.detectChanges();
    expect(setGranularitySpy).toHaveBeenCalledWith("30days");
    expect(component.timeGranularity()).toBe("30days");
  });

  it("debe renderizar el flujo operativo reciente (app-recent-activity-stream) en el bento inferior", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("app-recent-activity-stream")).toBeTruthy();
    expect(compiled.textContent).toContain("Flujo Operativo Reciente");
  });

  it("debe renderizar la tabla de reporte operativo de tickets y el botón de descarga CSV", () => {
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector("app-operational-reports-table")
    ).toBeTruthy();
    expect(compiled.textContent).toContain("Reporte Operativo de Tickets");

    const exportBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Descargar CSV")
    );
    expect(exportBtn).toBeTruthy();
    expect(exportBtn?.getAttribute("nv-button")).toBeDefined();
  });

  it("debe invocar refreshTelemetry() y llamar a facade.loadAll() al pulsar sincronizar", () => {
    const loadAllSpy = vi.spyOn(facade, "loadAll");
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const syncBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Sincronizar")
    );
    expect(syncBtn).toBeTruthy();
    expect(syncBtn?.getAttribute("nv-button")).toBeDefined();

    syncBtn?.click();
    expect(loadAllSpy).toHaveBeenCalled();
  });
});
