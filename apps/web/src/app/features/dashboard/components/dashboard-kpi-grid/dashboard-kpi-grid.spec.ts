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
    expect(compiled.querySelector("nv-badge")).toBeTruthy();
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

  it("debe renderizar micro-estadísticas reales y no incluir métricas comparativas hardcodeadas", () => {
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

    // Real dynamic metrics must be rendered
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.tickets.rotation
    );
    expect(compiled.textContent).toContain("95 min");
    expect(compiled.textContent).toContain("~1h 35m");
    expect(compiled.textContent).toContain("42.0%");
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.occupancy.normal
    );

    // Hardcoded comparative and fake metrics must NOT be present
    expect(compiled.textContent).not.toContain("+14.8%");
    expect(compiled.textContent).not.toContain("-6 min");
    expect(compiled.textContent).not.toContain("82%");
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.dashboard.kpis.revenue.comparison
    );
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.dashboard.kpis.revenue.digitalRatio
    );
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.dashboard.kpis.stay.comparison
    );
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.dashboard.kpis.stay.gracePeriod
    );
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.dashboard.kpis.occupancy.comparison
    );
  });

  it("no debe utilizar fallback engañoso de 12 veh/h cuando el flujo neto es bajo", () => {
    fixture.componentRef.setInput("summary", {
      activeTickets: 2,
      availableSlots: 98,
      avgStayMinutes: 30,
      completedTickets: 5,
      currency: "COP",
      occupancyRate: 2,
      occupiedSlots: 2,
      scope: "GLOBAL",
      todayRevenue: 50_000,
      totalCapacity: 100,
      totalTickets: 7,
    });
    fixture.componentRef.setInput("occupancyPercentage", 2);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain("+12 veh/h");
    expect(compiled.textContent).toContain("0 veh/h");
  });

  it("debe aplicar clase de color de umbral en barra de progreso según porcentaje", () => {
    fixture.componentRef.setInput("occupancyPercentage", 40);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector(".bg-success")).toBeTruthy();

    fixture.componentRef.setInput("occupancyPercentage", 75);
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-warning")).toBeTruthy();

    fixture.componentRef.setInput("occupancyPercentage", 95);
    fixture.detectChanges();
    expect(compiled.querySelector(".bg-destructive")).toBeTruthy();
  });

  it("debe renderizar métricas comparativas reales cuando el resumen contiene datos dinámicos", () => {
    fixture.componentRef.setInput("summary", {
      activeTickets: 42,
      availableSlots: 58,
      avgStayDeltaMinutes: -4.5,
      avgStayMinutes: 95.3,
      completedTickets: 120,
      currency: "COP",
      digitalPaymentRatio: 75,
      gracePeriodMinutes: 15,
      occupancyRate: 42,
      occupiedSlots: 42,
      revenueDeltaPercentage: 12.5,
      scope: "GLOBAL",
      todayRevenue: 1_250_000,
      totalCapacity: 100,
      totalTickets: 162,
    });
    fixture.componentRef.setInput("occupancyPercentage", 42);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;

    // Comparative values
    expect(compiled.textContent).toContain("+12.5%");
    expect(compiled.textContent).toContain("-4.5 min");
    expect(compiled.textContent).toContain("75%");
    expect(compiled.textContent).toContain("15 min");

    // Labels from APP_TEXTS
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.revenue.digitalRatio
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.revenue.comparison
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.stay.gracePeriod
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.kpis.stay.comparison
    );

    // Icons
    expect(
      compiled.querySelector('ng-icon[name="lucideArrowUpRight"]')
    ).toBeTruthy();
    expect(
      compiled.querySelector('ng-icon[name="lucideArrowDownRight"]')
    ).toBeTruthy();
  });

  it("debe aplicar text-rose-400 y lucideArrowDownRight ante delta de ingresos negativo", () => {
    fixture.componentRef.setInput("summary", {
      activeTickets: 10,
      availableSlots: 90,
      avgStayMinutes: 30,
      completedTickets: 15,
      currency: "COP",
      occupancyRate: 10,
      occupiedSlots: 10,
      revenueDeltaPercentage: -8.3,
      scope: "GLOBAL",
      todayRevenue: 100_000,
      totalCapacity: 100,
      totalTickets: 25,
    });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("-8.3%");
    const revenueDeltaEl = compiled.querySelector(".text-rose-400");
    expect(revenueDeltaEl).toBeTruthy();
    expect(
      revenueDeltaEl?.querySelector('ng-icon[name="lucideArrowDownRight"]')
    ).toBeTruthy();
  });

  it("debe aplicar text-rose-400 y lucideArrowUpRight ante delta de permanencia positivo (mayor congestión)", () => {
    fixture.componentRef.setInput("summary", {
      activeTickets: 10,
      availableSlots: 90,
      avgStayDeltaMinutes: 5,
      avgStayMinutes: 45,
      completedTickets: 15,
      currency: "COP",
      occupancyRate: 10,
      occupiedSlots: 10,
      scope: "GLOBAL",
      todayRevenue: 100_000,
      totalCapacity: 100,
      totalTickets: 25,
    });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("+5.0 min");
    const stayDeltaEl = compiled.querySelector(".text-rose-400");
    expect(stayDeltaEl).toBeTruthy();
    expect(
      stayDeltaEl?.querySelector('ng-icon[name="lucideArrowUpRight"]')
    ).toBeTruthy();
  });

  it("debe aceptar y renderizar metrics provisto directamente via input", () => {
    fixture.componentRef.setInput("metrics", {
      occupancy: {
        clampedPercentage: 55,
        deltaClass: "text-emerald-400",
        deltaText: "Normal <70%",
        occupiedSlots: 55,
        percentage: 55,
        progressClass: "bg-emerald-500",
        totalCapacity: 100,
      },
      revenue: {
        currency: "COP",
        digitalPaymentRatioText: "80%",
        hasDigitalRatio: true,
        hasRevenueDelta: true,
        revenueDeltaClass: "text-emerald-400",
        revenueDeltaIcon: "lucideArrowUpRight",
        revenueDeltaText: "+15.0%",
        todayRevenue: 300_000,
      },
      stay: {
        completedTickets: 50,
        formattedAvgStayHours: "~1h 0m",
        formattedAvgStayMinutes: 60,
        gracePeriodMinutes: 10,
        hasGracePeriod: true,
        hasStayDelta: true,
        stayDeltaClass: "text-rose-400",
        stayDeltaIcon: "lucideArrowUpRight",
        stayDeltaText: "+10.0 min",
      },
      tickets: {
        activeTickets: 25,
        netFlowRateText: "+1 veh/h",
        totalOrCompletedTickets: 50,
      },
    });
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("55.0%");
    expect(compiled.textContent).toContain("55 / 100");
    expect(compiled.textContent).toContain("$300,000");
    expect(compiled.textContent).toContain("+15.0%");
    expect(compiled.textContent).toContain("80%");
    expect(compiled.textContent).toContain("25");
    expect(compiled.textContent).toContain("+1 veh/h");
    expect(compiled.textContent).toContain("60 min");
    expect(compiled.textContent).toContain("~1h 0m");
    expect(compiled.textContent).toContain("+10.0 min");
  });
});
