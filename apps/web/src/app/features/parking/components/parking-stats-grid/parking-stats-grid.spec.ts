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

  it("should render all 4 stat cards with proper values", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Plazas Ocupadas");
    expect(textContent).toContain("45 / 100");
    expect(textContent).toContain("55 disponibles");

    expect(textContent).toContain("Ocupación");
    expect(textContent).toContain("45%");

    expect(textContent).toContain("Moneda Base");
    expect(textContent).toContain("COP");

    expect(textContent).toContain("Coordenadas");
    expect(textContent).toContain("4.6097, -74.0817");
  });

  it("should update display when inputs change", () => {
    hostComponent.totalSlots.set(200);
    hostComponent.occupiedSlots.set(160);
    hostComponent.availableSlots.set(40);
    hostComponent.occupationRate.set(80);
    hostComponent.currency.set("USD");
    hostComponent.coordinates.set({ latitude: 40.7128, longitude: -74.006 });
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("160 / 200");
    expect(textContent).toContain("40 disponibles");
    expect(textContent).toContain("80%");
    expect(textContent).toContain("USD");
    expect(textContent).toContain("40.7128, -74.006");
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
    expect(grid.formattedCoords()).toBe("10.5, -66.9");
  });
});
