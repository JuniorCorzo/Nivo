import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
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

  it("debe instanciar Chart.js y renderizar curva de ocupación por horas", () => {
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
  });

  it("debe manejar gracefully array de datos vacío", () => {
    fixture.componentRef.setInput("data", []);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.chartInstance?.data.datasets[0].data).toEqual([]);
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
