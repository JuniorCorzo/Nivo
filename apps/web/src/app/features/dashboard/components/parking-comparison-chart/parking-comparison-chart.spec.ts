import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TooltipItem, TooltipModel } from "chart.js";
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

  it("debe configurar dataset y tooltip con formato detallado de plazas", () => {
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
    ]);
    fixture.detectChanges();

    /* SAFETY: Chart dataset is configured as a bar dataset with barPercentage, categoryPercentage, borderRadius */
    const dataset = component.chartInstance?.data.datasets[0] as
      | {
          barPercentage?: number;
          borderRadius?: number;
          categoryPercentage?: number;
        }
      | undefined;
    expect(dataset?.barPercentage).toBe(0.65);
    expect(dataset?.categoryPercentage).toBe(0.85);
    expect(dataset?.borderRadius).toBe(4);

    const tooltipCallback =
      component.chartInstance?.options.plugins?.tooltip?.callbacks?.label;
    /* SAFETY: Mock TooltipItem context containing dataIndex and parsed coordinates for testing label */
    const mockContext = {
      dataIndex: 0,
      parsed: { x: 75 },
    } as TooltipItem<"bar">;
    /* SAFETY: Chart.js TooltipModel context is unused in label callback */
    const mockModel = {} as TooltipModel<"bar">;
    const tooltipText = tooltipCallback?.call(mockModel, mockContext);
    expect(tooltipText).toBe(" Ocupación: 75% (75 de 100 plazas)");
  });

  it("debe renderizar tarjetas de ranking de sedes con porcentaje, umbrales y barra de progreso", () => {
    fixture.componentRef.setInput("data", [
      {
        activeTickets: 90,
        avgStayMinutes: 70,
        occupancyRate: 92,
        occupiedSlots: 92,
        parkingId: "p1",
        parkingName: "Sede Poblado",
        todayRevenue: 2_140_000,
        totalSlots: 100,
      },
      {
        activeTickets: 30,
        avgStayMinutes: 40,
        occupancyRate: 65,
        occupiedSlots: 65,
        parkingId: "p2",
        parkingName: "Sede Chapinero",
        todayRevenue: 850_000,
        totalSlots: 100,
      },
    ]);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="facility-cards-ranking"]')
    ).toBeTruthy();
    expect(compiled.textContent).toContain("Sede Poblado");
    expect(compiled.textContent).toContain("92.0% CRÍTICO");
    expect(compiled.textContent).toContain("Sede Chapinero");
    expect(compiled.textContent).toContain("65.0% NORMAL");
    expect(compiled.textContent).toMatch(/\$2[.,]140[.,]000 COP/u);
  });

  it("al hacer click en una tarjeta de sede debe emitir parkingSelected", () => {
    fixture.componentRef.setInput("data", [
      {
        activeTickets: 90,
        avgStayMinutes: 70,
        occupancyRate: 92,
        occupiedSlots: 92,
        parkingId: "p1",
        parkingName: "Sede Poblado",
        todayRevenue: 2_140_000,
        totalSlots: 100,
      },
    ]);
    fixture.detectChanges();

    let selectedId: string | null = null;
    component.parkingSelected.subscribe((id: string) => (selectedId = id));

    /* SAFETY: Card query returns an HTMLElement */
    const card = fixture.nativeElement.querySelector(
      '[data-testid="facility-card-p1"]'
    ) as HTMLElement;
    card.click();
    expect(selectedId).toBe("p1");
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
