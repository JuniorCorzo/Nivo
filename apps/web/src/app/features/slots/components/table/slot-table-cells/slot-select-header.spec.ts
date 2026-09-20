import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotSelectHeaderComponent } from "./slot-select-header";

describe("SlotSelectHeaderComponent", () => {
  let fixture: ComponentFixture<SlotSelectHeaderComponent>;
  let component: SlotSelectHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotSelectHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotSelectHeaderComponent);
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
