import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { ParkingComparisonChartComponent } from "./parking-comparison-chart";

describe("ParkingComparisonChartComponent", () => {
  let component: ParkingComparisonChartComponent;
  let fixture: ComponentFixture<ParkingComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingComparisonChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingComparisonChartComponent);
    component = fixture.componentInstance;
  });

  it("debe instanciar Chart.js y renderizar barras con datos válidos", () => {
    fixture.componentRef.setInput("data", [
      {
        activeTickets: 75,
        avgStayMinutes: 60,
        occupancyRate: 75,
        occupiedSlots: 75,
        parkingId: "p1",
        parkingName: "Sede Centro",
        todayRevenue: 300_000,
        totalSlots: 100,
      },
      {
        activeTickets: 32,
        avgStayMinutes: 45,
        occupancyRate: 40,
        occupiedSlots: 32,
        parkingId: "p2",
        parkingName: "Sede Norte",
        todayRevenue: 150_000,
        totalSlots: 80,
      },
    ]);
    fixture.detectChanges();
    expect(component.chartInstance).toBeDefined();
    expect(component.chartInstance?.data.labels).toEqual([
      "Sede Centro",
      "Sede Norte",
    ]);
  });

  it("debe manejar gracefully arrays vacíos mostrando mensaje de estado vacío sin crear instancia de chart", () => {
    fixture.componentRef.setInput("data", []);
    fixture.detectChanges();
    expect(component.chartInstance).toBeNull();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      "No hay datos disponibles para la comparativa de sedes"
    );
  });

  it("al hacer click en una barra debe emitir evento parkingSelected con el parkingId correspondiente", () => {
    let selectedId: string | null = null;
    component.parkingSelected.subscribe((id: string) => (selectedId = id));

    component.handleBarClick("p1");
    expect(selectedId).toBe("p1");
  });

  it("debe invocar chart.destroy() al destruir el componente para prevenir memory leaks", () => {
    fixture.componentRef.setInput("data", [
      {
        activeTickets: 5,
        avgStayMinutes: 30,
        occupancyRate: 50,
        occupiedSlots: 5,
        parkingId: "p1",
        parkingName: "Sede A",
        todayRevenue: 1000,
        totalSlots: 10,
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
