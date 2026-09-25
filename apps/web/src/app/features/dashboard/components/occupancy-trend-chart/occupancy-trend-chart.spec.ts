import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OccupancyTrendChartComponent } from "./occupancy-trend-chart";
import { vi } from "vitest";

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
        hourBucket: "2026-09-24T08:00:00Z",
        checkins: 12,
        checkouts: 2,
        totalCapacity: 50,
        estimatedOccupancyRate: 24.0,
      },
      {
        hourBucket: "2026-09-24T09:00:00Z",
        checkins: 25,
        checkouts: 10,
        totalCapacity: 50,
        estimatedOccupancyRate: 54.0,
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
        hourBucket: "2026-09-24T10:00:00Z",
        checkins: 5,
        checkouts: 3,
        totalCapacity: 20,
        estimatedOccupancyRate: 10.0,
      },
    ]);
    fixture.detectChanges();

    const destroySpy = vi.spyOn(component.chartInstance!, "destroy");
    fixture.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
