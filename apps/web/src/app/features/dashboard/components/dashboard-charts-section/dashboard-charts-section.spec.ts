import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardChartsSectionComponent } from "./dashboard-charts-section";

describe("DashboardChartsSectionComponent", () => {
  let fixture: ComponentFixture<DashboardChartsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardChartsSectionComponent);
  });

  it("debe envolver los gráficos de tendencia y distribución en contenedores nv-card con encabezados", () => {
    fixture.componentRef.setInput(
      "title",
      APP_TEXTS.dashboard.chart.titleHourly
    );
    fixture.componentRef.setInput(
      "subtitle",
      APP_TEXTS.dashboard.chart.subtitles.today
    );
    fixture.componentRef.setInput("summary", {
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
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.titleHourly
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.distribution.title
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.distribution.subtitle
    );
    expect(compiled.textContent).toContain("Total: 100");
    expect(compiled.querySelector("app-occupancy-trend-chart")).toBeTruthy();
    expect(
      compiled.querySelector("app-slot-distribution-donut-chart")
    ).toBeTruthy();
  });

  it("debe renderizar las leyendas de entradas, salidas y ocupación desde APP_TEXTS", () => {
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.chart.entries);
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.chart.exits);
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.legendOccupancy
    );
  });
});
