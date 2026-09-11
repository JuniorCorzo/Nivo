import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import type { SlotGroupOption } from "./slot-group-edit-modal.component";
import { SlotGroupEditModalComponent } from "./slot-group-edit-modal.component";

describe("SlotGroupEditModalComponent", () => {
  let component: SlotGroupEditModalComponent;
  let fixture: ComponentFixture<SlotGroupEditModalComponent>;

  const mockGroups: SlotGroupOption[] = [
    { count: 5, prefix: "A", zone: "NORTE" },
    { count: 3, prefix: "B", zone: "SUR" },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotGroupEditModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotGroupEditModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("groups", mockGroups);
    fixture.componentRef.setInput("initialZone", "NORTE");
    fixture.componentRef.setInput("initialPrefix", "A");
    fixture.detectChanges();
  });

  it("should create component and pre-select matching group", () => {
    expect(component).toBeTruthy();
    expect(component.selectedGroupKey()).toBe("NORTE:::A");
    expect(component.selectedGroup()).toEqual(mockGroups[0]);
    expect(component.newZone()).toBe("NORTE");
    expect(component.newPrefix()).toBe("A");
  });

  it("should auto-select single group if groups has only 1 item and no initial values", () => {
    const singleGroupFixture = TestBed.createComponent(
      SlotGroupEditModalComponent
    );
    const comp = singleGroupFixture.componentInstance;
    singleGroupFixture.componentRef.setInput("parkingId", "parking-1");
    singleGroupFixture.componentRef.setInput("groups", [
      { count: 10, prefix: "C", zone: "ESTE" },
    ]);
    singleGroupFixture.detectChanges();

    expect(comp.selectedGroupKey()).toBe("ESTE:::C");
    expect(comp.newZone()).toBe("ESTE");
    expect(comp.newPrefix()).toBe("C");
  });

  it("should display message when no group is selected", () => {
    const unselectedFixture = TestBed.createComponent(
      SlotGroupEditModalComponent
    );
    const comp = unselectedFixture.componentInstance;
    unselectedFixture.componentRef.setInput("parkingId", "parking-1");
    unselectedFixture.componentRef.setInput("groups", mockGroups);
    unselectedFixture.detectChanges();

    expect(comp.selectedGroupKey()).toBe("");
    expect(comp.selectedGroup()).toBeNull();
    const text = unselectedFixture.nativeElement.textContent ?? "";
    expect(text).toContain(
      "Elegí un grupo en el selector para configurar la nueva zona o prefijo."
    );
  });

  it("should display group slot count badge when group is selected", () => {
    const text = fixture.nativeElement.textContent ?? "";
    expect(text).toContain("Plazas en este grupo");
    expect(text).toContain("5 plazas");
  });

  it("should update selected group and inputs on selection", () => {
    component.onGroupSelect("SUR:::B");
    fixture.detectChanges();

    expect(component.selectedGroupKey()).toBe("SUR:::B");
    expect(component.newZone()).toBe("SUR");
    expect(component.newPrefix()).toBe("B");
    expect(component.selectedGroup()).toEqual(mockGroups[1]);

    const text = fixture.nativeElement.textContent ?? "";
    expect(text).toContain("3 plazas");
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

  it("should emit cancel when cancel button is clicked", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    component.onCancel(new MouseEvent("click"));
    expect(spy).toHaveBeenCalled();
  });

  it("should emit cancel on Escape keydown", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    const stopPropagationSpy = vi.spyOn(escapeEvent, "stopPropagation");

    component.onKeydownEscape(escapeEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it("should emit cancel when clicking backdrop (target === currentTarget)", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    const backdropEl = fixture.nativeElement.querySelector('[role="dialog"]');
    backdropEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(spy).toHaveBeenCalled();
  });

  it("should not emit cancel when clicking inside dialog panel", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    const panelEl = fixture.nativeElement.querySelector('[role="dialog"] > div');
    panelEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(spy).not.toHaveBeenCalled();
  });

  it("should update selected group, zone, and prefix on onGroupOptionSelect", () => {
    component.onGroupOptionSelect(mockGroups[1]);
    fixture.detectChanges();

    expect(component.selectedGroupKey()).toBe("SUR:::B");
    expect(component.newZone()).toBe("SUR");
    expect(component.newPrefix()).toBe("B");
    expect(component.selectedGroup()).toEqual(mockGroups[1]);
  });
});
