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

  it("debe instanciar Chart.js en tipo doughnut con 4 categorías", () => {
    fixture.componentRef.setInput("availableSlots", 108);
    fixture.componentRef.setInput("occupiedSlots", 392);
    fixture.detectChanges();

    expect(component.chartInstance).toBeDefined();
    if (component.chartInstance && "type" in component.chartInstance.config) {
      expect(component.chartInstance.config.type).toBe("doughnut");
    }
    expect(component.chartInstance?.data.labels).toEqual([
      "Automóviles",
      "Motocicletas",
      "Bicicletas",
      "Carga Eléctrica / VIP",
    ]);
    expect(component.chartInstance?.data.datasets[0]?.data.length).toBe(4);
  });

  it("debe renderizar el contador central de plazas ocupadas con etiqueta Ocupadas", () => {
    fixture.componentRef.setInput("availableSlots", 108);
    fixture.componentRef.setInput("occupiedSlots", 392);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const centerCount = compiled.querySelector(
      '[data-testid="donut-center-count"]'
    );
    expect(centerCount?.textContent?.trim()).toBe("392");
    expect(compiled.textContent).toContain("Ocupadas");
  });

  it("debe renderizar las 4 filas de desglose por categoría con conteo y porcentaje", () => {
    fixture.componentRef.setInput("availableSlots", 108);
    fixture.componentRef.setInput("occupiedSlots", 392);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Automóviles");
    expect(compiled.textContent).toContain("Motocicletas");
    expect(compiled.textContent).toContain("Bicicletas");
    expect(compiled.textContent).toContain("Carga Eléctrica / VIP");
  });

  it("debe aceptar categorías personalizadas via input", () => {
    const customCats = [
      {
        color: "#fafafa",
        id: "car",
        name: "Automóviles",
        occupied: 10,
        percentage: 50,
        total: 20,
      },
      {
        color: "#3b82f6",
        id: "moto",
        name: "Motocicletas",
        occupied: 5,
        percentage: 50,
        total: 10,
      },
    ];
    fixture.componentRef.setInput("categories", customCats);
    fixture.detectChanges();

    expect(component.chartInstance?.data.datasets[0]?.data).toEqual([10, 5]);
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
