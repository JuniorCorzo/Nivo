import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ValidationError } from "@angular/forms/signals";
import { form, required } from "@angular/forms/signals";

import { ParkingAddressSectionComponent } from "./parking-address-section";

@Component({
  imports: [ParkingAddressSectionComponent],
  standalone: true,
  template: `
    <app-parking-address-section
      [streetField]="addressForm.street"
      [streetError]="streetError()"
      [stateField]="addressForm.state"
      [stateError]="stateError()"
      [cityField]="addressForm.city"
      [cityError]="cityError()"
      [zipCodeField]="addressForm.zipCode"
      [zipCodeError]="zipCodeError()"
      [departments]="departments()"
      [cities]="cities()"
      (stateSelectionChange)="onStateSelected($event)"
      (citySelectionChange)="onCitySelected($event)"
    />
  `,
})
class TestHostComponent {
  public addressModel = signal({
    city: "Bogotá",
    state: "Cundinamarca",
    street: "Calle 100 # 15-20",
    zipCode: "110111",
  });

  public addressForm = form(this.addressModel, (path) => {
    required(path.street);
    required(path.state);
    required(path.city);
  });

  public streetError = signal<ValidationError.WithFieldTree[] | undefined>([]);
  public stateError = signal<ValidationError.WithFieldTree[] | undefined>([]);
  public cityError = signal<ValidationError.WithFieldTree[] | undefined>([]);
  public zipCodeError = signal<ValidationError.WithFieldTree[] | undefined>([]);

  public departments = signal<string[]>(["Cundinamarca", "Antioquia", "Valle"]);
  public cities = signal<string[]>(["Bogotá", "Soacha", "Chía"]);

  public selectedState: string | null = null;
  public selectedCity: string | null = null;

  public onStateSelected(state: string): void {
    this.selectedState = state;
  }

  public onCitySelected(city: string): void {
    this.selectedCity = city;
  }
}

describe("ParkingAddressSectionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingAddressSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component instance via host", () => {
    expect(hostComponent).toBeTruthy();
  });

  it("should render address inputs and section headers", () => {
    const textContent = fixture.nativeElement.textContent || "";
    expect(textContent).toContain("Dirección");
    expect(textContent).toContain("Dirección física");
  });

  it("should emit stateSelectionChange when state combobox changes", () => {
    /* SAFETY: Querying child ParkingAddressSectionComponent instance */
    const addressSection = fixture.debugElement.children[0]
      .componentInstance as ParkingAddressSectionComponent;

    addressSection.stateSelectionChange.emit("Antioquia");
    expect(hostComponent.selectedState).toBe("Antioquia");
  });

  it("should emit citySelectionChange when city combobox changes", () => {
    /* SAFETY: Querying child ParkingAddressSectionComponent instance */
    const addressSection = fixture.debugElement.children[0]
      .componentInstance as ParkingAddressSectionComponent;

    addressSection.citySelectionChange.emit("Medellín");
    expect(hostComponent.selectedCity).toBe("Medellín");
  });

  it("should bind departments and cities inputs correctly", () => {
    /* SAFETY: Querying child ParkingAddressSectionComponent instance */
    const addressSection = fixture.debugElement.children[0]
      .componentInstance as ParkingAddressSectionComponent;

    expect(addressSection.departments()).toEqual([
      "Cundinamarca",
      "Antioquia",
      "Valle",
    ]);
    expect(addressSection.cities()).toEqual(["Bogotá", "Soacha", "Chía"]);

    hostComponent.departments.set(["Santander"]);
    hostComponent.cities.set(["Bucaramanga"]);
    fixture.detectChanges();

    expect(addressSection.departments()).toEqual(["Santander"]);
    expect(addressSection.cities()).toEqual(["Bucaramanga"]);
  });
});
