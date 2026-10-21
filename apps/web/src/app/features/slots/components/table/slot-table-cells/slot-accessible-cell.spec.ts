import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotAccessibleCellComponent } from "./slot-accessible-cell";

describe("SlotAccessibleCellComponent", () => {
  let fixture: ComponentFixture<SlotAccessibleCellComponent>;
  let component: SlotAccessibleCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotAccessibleCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotAccessibleCellComponent);
    component = fixture.componentInstance;
  });

  it("should render PMR badge when isAccessible is true", () => {
    fixture.componentRef.setInput("isAccessible", true);
    fixture.detectChanges();

    expect(component.isAccessible()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("PMR");
    const badge = fixture.nativeElement.querySelector("nv-badge");
    expect(badge).toBeTruthy();
  });

  it("should render minus icon and nv-muted when isAccessible is false", () => {
    fixture.componentRef.setInput("isAccessible", false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain("PMR");
    const muted = fixture.nativeElement.querySelector("nv-muted");
    expect(muted).toBeTruthy();
    const icon = fixture.nativeElement.querySelector(
      'ng-icon[name="lucideMinus"]'
    );
    expect(icon).toBeTruthy();
  });
});
