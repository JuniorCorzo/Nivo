import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardKpiGridComponent } from "./dashboard-kpi-grid";

describe("DashboardKpiGridComponent", () => {
  let fixture: ComponentFixture<DashboardKpiGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardKpiGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardKpiGridComponent);
  });

  it("debe renderizar título de sección y estado En línea", () => {
    fixture.componentRef.setInput("title", "Métricas de la Sede");
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Métricas de la Sede");
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.kpis.liveStatus);
  });

  it("debe renderizar iconos Lucide en las cuatro tarjetas de KPI", () => {
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

  it("debe renderizar micro-estadísticas calculadas y textos desde APP_TEXTS", () => {
    fixture.componentRef.setInput("summary", {
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
    fixture.componentRef.setInput("occupancyPercentage", 42);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
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
    expect(compiled.textContent).toContain("42.0%");
  });

  it("debe aplicar clase de color de umbral en barra de progreso según porcentaje", () => {
    fixture.componentRef.setInput("occupancyPercentage", 40);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector(".bg-emerald-500")).toBeTruthy();

    fixture.componentRef.setInput("occupancyPercentage", 75);
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-amber-500")).toBeTruthy();

    fixture.componentRef.setInput("occupancyPercentage", 95);
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-rose-500")).toBeTruthy();
  });
});
