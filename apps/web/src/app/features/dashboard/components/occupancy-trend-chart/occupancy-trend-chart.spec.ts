import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { vi } from "vitest";

import { OccupancyTrendChartComponent } from "./occupancy-trend-chart";

describe("OccupancyTrendChartComponent", () => {
  let component: OccupancyTrendChartComponent;
  let fixture: ComponentFixture<OccupancyTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccupancyTrendChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccupancyTrendChartComponent);
    component = fixture.componentInstance;
  });

  it("debe instanciar Chart.js y renderizar curva de ocupación por horas cuando granularity es today", () => {
    fixture.componentRef.setInput("timeGranularity", "today");
    fixture.componentRef.setInput("data", [
      {
        checkins: 12,
        checkouts: 2,
        estimatedOccupancyRate: 24,
        hourBucket: "2026-09-24T08:00:00Z",
        totalCapacity: 50,
      },
      {
        checkins: 25,
        checkouts: 10,
        estimatedOccupancyRate: 54,
        hourBucket: "2026-09-24T09:00:00Z",
        totalCapacity: 50,
      },
    ]);
    fixture.detectChanges();

    expect(component.chartInstance).toBeDefined();
    expect(component.chartInstance?.data.datasets.length).toBeGreaterThan(0);
    expect(component.chartInstance?.data.labels).toHaveLength(2);
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.peakHourIngress
    );
  });

  it("debe renderizar estado vacío con icono y textos de APP_TEXTS cuando data está vacía", () => {
    fixture.componentRef.setInput("data", []);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector(
      '[data-testid="chart-empty-state"]'
    );
    expect(emptyState).toBeTruthy();
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.emptyStateTitle
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.emptyStateSubtitle
    );
    expect(compiled.querySelector("canvas")).toBeNull();
    expect(component.chartInstance).toBeNull();
  });

  it("debe agrupar puntos por día y formatear etiquetas cuando granularity es 7days", () => {
    fixture.componentRef.setInput("timeGranularity", "7days");
    fixture.componentRef.setInput("data", [
      {
        checkins: 10,
        checkouts: 5,
        estimatedOccupancyRate: 20,
        hourBucket: "2026-09-24T08:00:00Z",
        totalCapacity: 100,
      },
      {
        checkins: 15,
        checkouts: 5,
        estimatedOccupancyRate: 30,
        hourBucket: "2026-09-24T14:00:00Z",
        totalCapacity: 100,
      },
      {
        checkins: 30,
        checkouts: 10,
        estimatedOccupancyRate: 50,
        hourBucket: "2026-09-25T10:00:00Z",
        totalCapacity: 100,
      },
    ]);
    fixture.detectChanges();

    expect(component.chartInstance).toBeDefined();
    expect(component.chartInstance?.data.labels).toHaveLength(2);
    expect(component.chartInstance?.data.labels?.[0]).toContain("24");
    expect(component.chartInstance?.data.labels?.[1]).toContain("25");

    const checkinDataset = component.chartInstance?.data.datasets[1];
    expect(checkinDataset?.data).toEqual([25, 30]);

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.chart.peakDayIngress
    );
    expect(component.peakIngressValue()).toContain("25");
  });

  it("debe invocar chart.destroy() al destruir el componente", () => {
    fixture.componentRef.setInput("data", [
      {
        checkins: 5,
        checkouts: 3,
        estimatedOccupancyRate: 10,
        hourBucket: "2026-09-24T10:00:00Z",
        totalCapacity: 20,
      },
    ]);
    fixture.detectChanges();

    const instance = component.chartInstance;
    expect(instance).toBeDefined();
    if (instance) {
      const destroySpy = vi.spyOn(instance, "destroy");
      fixture.destroy();
      expect(destroySpy).toHaveBeenCalled();
    }
  });
});
