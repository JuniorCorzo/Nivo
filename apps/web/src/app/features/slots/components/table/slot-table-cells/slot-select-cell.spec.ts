import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotSelectCellComponent } from "./slot-select-cell";

describe("SlotSelectCellComponent", () => {
  let fixture: ComponentFixture<SlotSelectCellComponent>;
  let component: SlotSelectCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotSelectCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotSelectCellComponent);
    component = fixture.componentInstance;
  });

  it("should render unchecked by default", () => {
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
  });

  it("should reflect checked input", () => {
    fixture.componentRef.setInput("checked", true);
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
  });

  it("should emit toggle output when toggled", () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);

    component.onToggle(true);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
