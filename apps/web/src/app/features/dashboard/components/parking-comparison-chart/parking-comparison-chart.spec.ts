import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ParkingComparisonChartComponent } from "./parking-comparison-chart";
import { vi } from "vitest";

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
        parkingId: "p1",
        parkingName: "Sede Centro",
        totalSlots: 100,
        occupiedSlots: 75,
        occupancyRate: 75.0,
        todayRevenue: 300000,
        activeTickets: 75,
        avgStayMinutes: 60,
      },
      {
        parkingId: "p2",
        parkingName: "Sede Norte",
        totalSlots: 80,
        occupiedSlots: 32,
        occupancyRate: 40.0,
        todayRevenue: 150000,
        activeTickets: 32,
        avgStayMinutes: 45,
      },
    ]);
    fixture.detectChanges();
    expect(component.chartInstance).toBeDefined();
    expect(component.chartInstance?.data.labels).toEqual([
      "Sede Centro",
      "Sede Norte",
    ]);
  });

  it("debe manejar gracefully arrays vacíos sin lanzar errores ni excepciones", () => {
    fixture.componentRef.setInput("data", []);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.chartInstance?.data.datasets[0].data).toEqual([]);
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
        parkingId: "p1",
        parkingName: "Sede A",
        totalSlots: 10,
        occupiedSlots: 5,
        occupancyRate: 50.0,
        todayRevenue: 1000,
        activeTickets: 5,
        avgStayMinutes: 30,
      },
    ]);
    fixture.detectChanges();

    const destroySpy = vi.spyOn(component.chartInstance!, "destroy");
    fixture.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
