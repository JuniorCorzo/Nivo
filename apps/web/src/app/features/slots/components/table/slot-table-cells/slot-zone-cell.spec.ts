import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotZoneCellComponent } from "./slot-zone-cell";

describe("SlotZoneCellComponent", () => {
  let fixture: ComponentFixture<SlotZoneCellComponent>;
  let component: SlotZoneCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotZoneCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotZoneCellComponent);
    component = fixture.componentInstance;
  });

  it("should render zone text when provided", () => {
    fixture.componentRef.setInput("zone", "Piso 1");
    fixture.detectChanges();

    expect(component.zone()).toBe("Piso 1");
    expect(fixture.nativeElement.textContent).toContain("Piso 1");
  });

  it("should render 'Sin zona' when zone is empty or undefined", () => {
    fixture.componentRef.setInput("zone", "");
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Sin zona");
  });
});
