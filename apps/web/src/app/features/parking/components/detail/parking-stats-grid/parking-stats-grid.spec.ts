import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ParkingTelemetryModel } from "@core/models/parking-telemetry.model";
import type { Coordinates } from "@core/type/coordinates.type";
import type { OperatingHours } from "@core/type/operating-hours.type";
import type { SlotDistribution } from "@core/type/slot-distribution.type";

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
      [slotDistribution]="slotDistribution()"
      [operatingHours]="operatingHours()"
      [gracePeriodMinutes]="gracePeriodMinutes()"
      [gracePeriodPrice]="gracePeriodPrice()"
      [telemetry]="telemetry()"
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
  public slotDistribution = signal<SlotDistribution[]>([
    { count: 60, prefix: "A", type: "CAR", zone: "Piso 1" },
    { count: 40, prefix: "M", type: "MOTORCYCLE", zone: "Piso 2" },
  ]);
  public operatingHours = signal<OperatingHours>({
    closeTime: "22:00",
    openTime: "06:00",
  });
  public gracePeriodMinutes = signal(15);
  public gracePeriodPrice = signal(5000);
  public telemetry = signal<ParkingTelemetryModel | null>(null);
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
    expect(textContent).toContain("Autos en Sitio");
    expect(textContent).toContain("Motos en Sitio");
    expect(textContent).toContain("27 / 60 Plazas");
    expect(textContent).toContain("18 / 40 Plazas");

    // Card 2: Distribución y Zonas de Patio
    expect(textContent).toContain("Distribución y Zonas de Patio");
    expect(textContent).toContain("2 Zonas");
    expect(textContent).toContain("Autos: 60");
    expect(textContent).toContain("Motos: 40");
    expect(textContent).toContain("Zonas: 2");

    // Card 3: Operación & Políticas
    expect(textContent).toContain("Operación & Políticas");
    expect(textContent).toContain("15 min");
    expect(textContent).toContain("06:00 - 22:00");
    expect(textContent).toContain("Tarifa gracia: $ 5.000");
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

    // 45% -> success
    expect(gauge?.classList.contains("bg-success")).toBe(true);

    // 75% -> warning
    hostComponent.occupationRate.set(75);
    fixture.detectChanges();
    expect(gauge?.classList.contains("bg-warning")).toBe(true);

    // 95% -> destructive
    hostComponent.occupationRate.set(95);
    fixture.detectChanges();
    expect(gauge?.classList.contains("bg-destructive")).toBe(true);
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

  it("should prioritize telemetry input values over calculated ratios", () => {
    hostComponent.telemetry.set({
      availableSlots: 60,
      carOccupied: 28,
      carRate: 56,
      carTotal: 50,
      motoOccupied: 12,
      motoRate: 24,
      motoTotal: 50,
      occupancyRate: 40,
      occupiedSlots: 40,
      parkingId: "lot-1",
      totalCapacity: 100,
    });
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("28 / 50 Plazas (56%)");
    expect(textContent).toContain("12 / 50 Plazas (24%)");
    expect(textContent).toContain("Autos: 50");
    expect(textContent).toContain("Motos: 50");
  });
});
