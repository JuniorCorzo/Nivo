import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";

import { SlotMetadataBatchModalComponent } from "./slot-metadata-batch-modal.component";

const mockSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Parking Norte",
  prefix: "A",
  slotNumber: "A-001",
  status: "AVAILABLE",
  type: "CAR",
  zone: "A",
  ...overrides,
});

describe("SlotMetadataBatchModalComponent", () => {
  let component: SlotMetadataBatchModalComponent;
  let fixture: ComponentFixture<SlotMetadataBatchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotMetadataBatchModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotMetadataBatchModalComponent);
    component = fixture.componentInstance;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should render modal title and count of selected slots", () => {
    fixture.componentRef.setInput("selectedSlots", [
      mockSlot({ id: "1" }),
      mockSlot({ id: "2" }),
    ]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? "";
    expect(text).toContain("Editar equipamiento");
    expect(text).toContain("2 plazas");
  });

  it("should disable submit button and show warning when at least one slot is OCCUPIED", () => {
    fixture.componentRef.setInput("selectedSlots", [
      mockSlot({ id: "1", status: "AVAILABLE" }),
      mockSlot({ id: "2", status: "OCCUPIED" }),
    ]);
    fixture.detectChanges();

    expect(component.hasOccupiedSlots()).toBe(true);
    expect(component.canSubmit()).toBe(false);

    const warning = fixture.nativeElement.querySelector(".text-destructive");
    expect(warning).toBeTruthy();
    expect(warning.textContent).toContain("ocupada");

    const submitBtn = fixture.nativeElement.querySelector(
      '[data-testid="submit-metadata-btn"] button'
    );
    expect(submitBtn?.hasAttribute("disabled")).toBe(true);
  });

  it("should enable submit button when all selected slots are AVAILABLE", () => {
    fixture.componentRef.setInput("selectedSlots", [
      mockSlot({ id: "1", status: "AVAILABLE" }),
      mockSlot({ id: "2", status: "AVAILABLE" }),
    ]);
    fixture.detectChanges();

    expect(component.hasOccupiedSlots()).toBe(false);
    expect(component.canSubmit()).toBe(true);

    const submitBtn = fixture.nativeElement.querySelector(
      '[data-testid="submit-metadata-btn"] button'
    );
    expect(submitBtn?.hasAttribute("disabled")).toBe(false);
  });

  it("should emit submitMetadata with updated flags on submit", () => {
    const spy = vi.spyOn(component.submitMetadata, "emit");
    fixture.componentRef.setInput("selectedSlots", [
      mockSlot({ id: "1" }),
      mockSlot({ id: "2" }),
    ]);
    fixture.detectChanges();

    component.hasCharger.set(true);
    component.isAccessible.set(true);
    component.isActive.set(false);

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      hasCharger: true,
      isAccessible: true,
      isActive: false,
      slotIds: ["1", "2"],
    });
  });

  it("should emit cancel when cancel button or close is clicked", () => {
    const spy = vi.spyOn(component.cancel, "emit");
    component.onCancel(new MouseEvent("click"));
    expect(spy).toHaveBeenCalled();
  });
});
