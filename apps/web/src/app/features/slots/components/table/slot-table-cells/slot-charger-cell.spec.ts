import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotChargerCellComponent } from "./slot-charger-cell";

describe("SlotChargerCellComponent", () => {
  let fixture: ComponentFixture<SlotChargerCellComponent>;
  let component: SlotChargerCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotChargerCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotChargerCellComponent);
    component = fixture.componentInstance;
  });

  it("should render electric badge when hasCharger is true", () => {
    fixture.componentRef.setInput("hasCharger", true);
    fixture.detectChanges();

    expect(component.hasCharger()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("eléctrico");
  });

  it("should render standard badge when hasCharger is false", () => {
    fixture.componentRef.setInput("hasCharger", false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Estándar");
  });
});
