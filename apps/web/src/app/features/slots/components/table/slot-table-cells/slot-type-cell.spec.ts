import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotTypeCellComponent } from "./slot-type-cell";

describe("SlotTypeCellComponent", () => {
  let fixture: ComponentFixture<SlotTypeCellComponent>;
  let component: SlotTypeCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotTypeCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotTypeCellComponent);
    component = fixture.componentInstance;
  });

  it("should render CAR type label and icon", () => {
    fixture.componentRef.setInput("type", "CAR");
    fixture.detectChanges();

    expect(component.label()).toBe("Carro");
    expect(component.icon()).toBe("lucideCar");
    expect(fixture.nativeElement.textContent).toContain("Carro");
  });

  it("should render MOTORCYCLE type label and icon", () => {
    fixture.componentRef.setInput("type", "MOTORCYCLE");
    fixture.detectChanges();

    expect(component.label()).toBe("Moto");
    expect(component.icon()).toBe("lucideBike");
    expect(fixture.nativeElement.textContent).toContain("Moto");
  });

  it("should render BIKE type label and icon", () => {
    fixture.componentRef.setInput("type", "BIKE");
    fixture.detectChanges();

    expect(component.label()).toBe("Bicicleta");
    expect(component.icon()).toBe("lucideBike");
    expect(fixture.nativeElement.textContent).toContain("Bicicleta");
  });

  it("should render DISABLED type label and icon", () => {
    fixture.componentRef.setInput("type", "DISABLED");
    fixture.detectChanges();

    expect(component.label()).toBe("Discapacitado");
    expect(component.icon()).toBe("lucideAccessibility");
    expect(fixture.nativeElement.textContent).toContain("Discapacitado");
  });

  it("should render ELECTRIC_VEHICLE type label and icon", () => {
    fixture.componentRef.setInput("type", "ELECTRIC_VEHICLE");
    fixture.detectChanges();

    expect(component.label()).toBe("Eléctrico");
    expect(component.icon()).toBe("lucideZap");
    expect(fixture.nativeElement.textContent).toContain("Eléctrico");
  });
});
