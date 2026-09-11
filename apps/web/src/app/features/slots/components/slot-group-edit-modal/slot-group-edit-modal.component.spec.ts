import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotGroupEditModalComponent } from "./slot-group-edit-modal.component";

describe("SlotGroupEditModalComponent", () => {
  let component: SlotGroupEditModalComponent;
  let fixture: ComponentFixture<SlotGroupEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotGroupEditModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotGroupEditModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("currentZone", "NORTE");
    fixture.componentRef.setInput("currentPrefix", "A");
    fixture.detectChanges();
  });

  it("should create component and populate initial values", () => {
    expect(component).toBeTruthy();
    expect(component.newZone()).toBe("NORTE");
    expect(component.newPrefix()).toBe("A");
  });

  it("should render modal title and current group info", () => {
    const text = fixture.nativeElement.textContent ?? "";
    expect(text).toContain("Editar grupo de plazas");
    expect(text).toContain("NORTE");
    expect(text).toContain("A");
  });

  it("should disable submit button when there are no changes", () => {
    expect(component.hasChanges()).toBe(false);

    const submitBtn = fixture.nativeElement.querySelector(
      '[data-testid="submit-group-btn"] button'
    );
    expect(submitBtn?.hasAttribute("disabled")).toBe(true);
  });

  it("should enable submit button when zone or prefix changes", () => {
    component.newZone.set("SUR");
    fixture.detectChanges();

    expect(component.hasChanges()).toBe(true);

    const submitBtn = fixture.nativeElement.querySelector(
      '[data-testid="submit-group-btn"] button'
    );
    expect(submitBtn?.hasAttribute("disabled")).toBe(false);
  });

  it("should emit submitGroup with updated payload on submit", () => {
    const spy = vi.spyOn(component.submitGroup, "emit");

    component.newZone.set("SUR");
    component.newPrefix.set("B");

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      currentPrefix: "A",
      currentZone: "NORTE",
      newPrefix: "B",
      newZone: "SUR",
      parkingId: "parking-1",
    });
  });

  it("should emit cancel when cancel button or backdrop is clicked", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    component.onCancel(new MouseEvent("click"));
    expect(spy).toHaveBeenCalled();
  });
});
