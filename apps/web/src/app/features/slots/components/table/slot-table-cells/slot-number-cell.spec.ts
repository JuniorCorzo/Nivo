import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotNumberCellComponent } from "./slot-number-cell";

describe("SlotNumberCellComponent", () => {
  let fixture: ComponentFixture<SlotNumberCellComponent>;
  let component: SlotNumberCellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotNumberCellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotNumberCellComponent);
    component = fixture.componentInstance;
  });

  it("should render slotNumber in monospace font", () => {
    fixture.componentRef.setInput("slotNumber", "A-101");
    fixture.detectChanges();

    expect(component.slotNumber()).toBe("A-101");
    expect(fixture.nativeElement.textContent).toContain("A-101");
  });

  it("should apply text-foreground class when isActive is true", () => {
    fixture.componentRef.setInput("slotNumber", "A-101");
    fixture.componentRef.setInput("isActive", true);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector("span");
    expect(span.classList.contains("text-foreground")).toBe(true);
    expect(span.classList.contains("text-muted-foreground")).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain("Inactiva");
  });

  it("should apply text-muted-foreground class when isActive is false and not render badge", () => {
    fixture.componentRef.setInput("slotNumber", "A-101");
    fixture.componentRef.setInput("isActive", false);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector("span");
    expect(span.classList.contains("text-muted-foreground")).toBe(true);
    expect(span.classList.contains("text-foreground")).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain("Inactiva");
  });
});
