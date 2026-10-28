import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { Coordinates } from "@core/type/coordinates.type";

import { ParkingStatsGrid } from "./parking-stats-grid";

@Component({
  imports: [ParkingStatsGrid],
  standalone: true,
  template: `
    <app-parking-stats-grid
      [totalSlots]="totalSlots()"
      [occupiedSlots]="occupiedSlots()"
      [availableSlots]="availableSlots()"
      [occupationRate]="occupationRate()"
      [currency]="currency()"
      [coordinates]="coordinates()"
    />
  `,
})
class TestHostComponent {
  public totalSlots = signal(100);
  public occupiedSlots = signal(45);
  public availableSlots = signal(55);
  public occupationRate = signal(45);
  public currency = signal("COP");
  public coordinates = signal<Coordinates>({
    latitude: 4.6097,
    longitude: -74.0817,
  });
}

describe("ParkingStatsGrid", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingStatsGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it("should render all 3 telemetry cards with proper values and metrics", () => {
    const textContent = compiled.textContent || "";

    // Card 1: Global Occupancy Gauge
    expect(textContent).toContain("Ocupación General del Patio");
    expect(textContent).toContain("45%");
    expect(textContent).toContain("45 / 100 Plazas");
    expect(textContent).toContain("🚗 Autos en Sitio");
    expect(textContent).toContain("🏍️ Motos en Sitio");

    // Card 2: Recaudo Acumulado Turno
    expect(textContent).toContain("Recaudo Acumulado Turno");
    expect(textContent).toContain("Turno en curso · Taquilla 01");
    expect(textContent).toContain("Promedio ticket: $ 7.200");
    expect(textContent).toContain("Meta turno: 104%");

    // Card 3: Rotación & Permanencia
    expect(textContent).toContain("Rotación & Permanencia");
    expect(textContent).toContain("1h 35m");
    expect(textContent).toContain("Tiempo promedio de permanencia");
    expect(textContent).toContain("Índice Rotación: 4.2x / día");
    expect(textContent).toContain("En mora > 8h: 3");
  });

  it("should update display and metrics when inputs change", () => {
    hostComponent.totalSlots.set(200);
    hostComponent.occupiedSlots.set(160);
    hostComponent.availableSlots.set(40);
    hostComponent.occupationRate.set(80);
    hostComponent.currency.set("USD");
    hostComponent.coordinates.set({ latitude: 40.7128, longitude: -74.006 });
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("160 / 200 Plazas");
    expect(textContent).toContain("80%");
  });

  it("should apply correct gauge color class based on occupationRate", () => {
    const gauge = compiled.querySelector(".rounded-full > div");
    expect(gauge).toBeTruthy();

    // 45% -> emerald
    expect(gauge?.classList.contains("bg-emerald-500")).toBe(true);

    // 75% -> amber
    hostComponent.occupationRate.set(75);
    fixture.detectChanges();
    expect(gauge?.classList.contains("bg-amber-500")).toBe(true);

    // 95% -> red
    hostComponent.occupationRate.set(95);
    fixture.detectChanges();
    expect(gauge?.classList.contains("bg-red-500")).toBe(true);
  });

  it("should compute formattedCoords properly when initialized directly", () => {
    const gridFixture = TestBed.createComponent(ParkingStatsGrid);
    gridFixture.componentRef.setInput("totalSlots", 50);
    gridFixture.componentRef.setInput("occupiedSlots", 10);
    gridFixture.componentRef.setInput("availableSlots", 40);
    gridFixture.componentRef.setInput("occupationRate", 20);
    gridFixture.componentRef.setInput("currency", "EUR");
    gridFixture.componentRef.setInput("coordinates", {
      latitude: 10.5,
      longitude: -66.9,
    });
    gridFixture.detectChanges();

    const grid = gridFixture.componentInstance;
    expect(grid.formattedCoords()).toBe("10,5000, -66,9000");
  });
});
