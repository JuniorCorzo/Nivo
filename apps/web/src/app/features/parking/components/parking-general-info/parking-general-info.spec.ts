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
    id: "lot-123",
    name: "Parqueadero Central",
    occuppationRate: 40,
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
    expect(textContent).toContain("lot-123");
  });

  it("should format dates properly", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("2026");
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
      id: "lot-456",
      name: "Sin Dirección",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 10,
      updatedAt: "",
    });
    fixture.detectChanges();

    const textContent = compiled.textContent || "";
    expect(textContent).toContain("Sin dirección");
    expect(textContent).toContain("lot-456");
  });

  it("should format helper dates correctly", () => {
    const componentFixture = TestBed.createComponent(ParkingGeneralInfo);
    const component = componentFixture.componentInstance;
    expect(component.formattedDate("")).toBe("");
    expect(component.formattedDate("invalid-date")).toBe("invalid-date");
    const validDate = component.formattedDate("2026-05-10T14:20:00Z");
    expect(validDate).toContain("2026");
  });
});
