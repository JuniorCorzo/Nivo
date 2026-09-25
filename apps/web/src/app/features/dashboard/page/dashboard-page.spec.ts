import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { DashboardPage } from "./dashboard-page";
import { DashboardFacade } from "../facade/dashboard.facade";

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

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    facade = TestBed.inject(DashboardFacade);
  });

  it("con 1 sola sede debe renderizar vista limpia sin selector multi-sede", () => {
    facade.accessibleParkings.set([{ id: "p1", name: "Sede Única" }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeNull();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeNull();
  });

  it("con múltiples sedes debe renderizar selector con opción Todas las Sedes y gráfico comparativo en modo GLOBAL", () => {
    facade.accessibleParkings.set([
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    facade.activeScope.set({ mode: "GLOBAL" });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeTruthy();
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeTruthy();
  });

  it("debe utilizar exclusivamente componentes del @nivo-sass/design-system (cero raw buttons)", () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rawButtons = compiled.querySelectorAll("button:not([nv-button])");
    expect(rawButtons.length).toBe(0);
  });
});
