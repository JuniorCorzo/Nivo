import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { DashboardSseService } from "@core/services/dashboard-sse.service";

import { DashboardFacade } from "../facade/dashboard.facade";
import { DashboardPage } from "./dashboard-page";

describe("DashboardPage", () => {
  let _component: DashboardPage;
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
    _component = fixture.componentInstance;
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
});
