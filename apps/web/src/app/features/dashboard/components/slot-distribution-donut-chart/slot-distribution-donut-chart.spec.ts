import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { SlotDistributionDonutChartComponent } from "./slot-distribution-donut-chart";

describe("SlotDistributionDonutChartComponent", () => {
  let component: SlotDistributionDonutChartComponent;
  let fixture: ComponentFixture<SlotDistributionDonutChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotDistributionDonutChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotDistributionDonutChartComponent);
    component = fixture.componentInstance;
  });

  it("debe instanciar Chart.js en tipo doughnut con distribución de plazas", () => {
    fixture.componentRef.setInput("availableSlots", 40);
    fixture.componentRef.setInput("occupiedSlots", 60);
    fixture.detectChanges();

    expect(component.chartInstance).toBeDefined();
    if (component.chartInstance && "type" in component.chartInstance.config) {
      expect(component.chartInstance.config.type).toBe("doughnut");
    }
    expect(component.chartInstance?.data.datasets[0]?.data).toEqual([60, 40]);
  });

  it("debe manejar valores en cero sin error", () => {
    fixture.componentRef.setInput("availableSlots", 0);
    fixture.componentRef.setInput("occupiedSlots", 0);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it("debe invocar chart.destroy() al destruir el componente", () => {
    fixture.componentRef.setInput("availableSlots", 10);
    fixture.componentRef.setInput("occupiedSlots", 20);
    fixture.detectChanges();

    const chart = component.chartInstance;
    if (!chart) {
      throw new Error("Expected chartInstance to be present");
    }
    const destroySpy = vi.spyOn(chart, "destroy");
    fixture.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
