import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";

import { ParkingGeneralInfo } from "./parking-general-info";

@Component({
  imports: [ParkingGeneralInfo],
  standalone: true,
  template: ` <app-parking-general-info [parking]="parking()" /> `,
})
class TestHostComponent {
  public parking = signal<ParkingLotListItemModel>({
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Calle 100 # 15-20",
      zipCode: "110111",
    },
    coordinates: { latitude: 4.6097, longitude: -74.0817 },
    createdAt: "2026-01-01T10:30:00Z",
    currency: "COP",
    gracePeriodMinutes: 15,
    gracePeriodPrice: 5000,
    id: "lot-123",
    ivaRate: 0.19,
    name: "Parqueadero Central",
    occuppationRate: 40,
    operatingHours: { closeTime: "22:00", openTime: "06:00" },
    ownerName: "Juan Pérez",
    slotDistribution: [{ count: 30, prefix: "A", type: "CAR", zone: "Norte" }],
    totalCapacity: 50,
    updatedAt: "2026-01-02T15:45:00Z",
  });
}

describe("ParkingGeneralInfo", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingGeneralInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it("should render parking general details correctly", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Información General");
    expect(textContent).toContain("Juan Pérez");
    expect(textContent).toContain("COP");
    expect(textContent).toContain("Calle 100 # 15-20, Bogotá, Cundinamarca");
    expect(textContent).toContain("Colombia · 110111");
    expect(textContent).toContain("4,6097, -74,0817");
    expect(textContent).not.toContain("lot-123");
    expect(textContent).toContain("Políticas de liquidación");
    expect(textContent).toContain("15 min");
    expect(textContent).toContain("$ 5.000");
    expect(textContent).toContain("19%");
    expect(textContent).toContain("06:00 - 22:00");
  });

  it("should handle missing or empty address parts gracefully", () => {
    hostComponent.parking.set({
      address: {
        city: "",
        country: "",
        state: "",
        street: "",
        zipCode: "",
      },
      coordinates: { latitude: 0, longitude: 0 },
      createdAt: "",
      currency: "USD",
      gracePeriodMinutes: 0,
      gracePeriodPrice: 0,
      id: "lot-456",
      ivaRate: 0,
      name: "Sin Dirección",
      occuppationRate: 0,
      operatingHours: { closeTime: "18:00", openTime: "08:00" },
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 10,
      updatedAt: "",
    });
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Sin dirección");
    expect(textContent).not.toContain("lot-456");
  });

  it("should format gracePeriodText properly for days and hours", () => {
    hostComponent.parking.update((current) => ({
      ...current,
      gracePeriodMinutes: 1440,
    }));
    fixture.detectChanges();
    expect(compiled.textContent).toContain("1 día");

    hostComponent.parking.update((current) => ({
      ...current,
      gracePeriodMinutes: 120,
    }));
    fixture.detectChanges();
    expect(compiled.textContent).toContain("2 horas");
  });
});
