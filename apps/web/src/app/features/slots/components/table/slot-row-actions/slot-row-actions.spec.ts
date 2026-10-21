import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";

import { SlotRowActionsComponent } from "./slot-row-actions";

const mockSlot: SlotSummary = {
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "P",
  prefix: "A",
  slotNumber: "001",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z",
};

describe("SlotRowActionsComponent", () => {
  let fixture: ComponentFixture<SlotRowActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotRowActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotRowActionsComponent);
    fixture.componentRef.setInput("slot", mockSlot);
    fixture.detectChanges();
  });

  it("should render 4 action buttons", () => {
    const buttons = fixture.nativeElement.querySelectorAll("button");
    expect(buttons.length).toBe(4);
    const titles = Array.from(buttons, (b: HTMLButtonElement) =>
      b.getAttribute("title")
    );
    expect(titles).toEqual([
      "Ver detalle",
      "Editar",
      "Cambiar estado",
      "Eliminar",
    ]);
  });

  it("should emit viewDetail when clicking view detail button", () => {
    let emitted: SlotSummary | undefined;
    fixture.componentInstance.viewDetail.subscribe(
      (val: SlotSummary) => (emitted = val)
    );

    /* SAFETY: The view detail button is rendered in the component template */
    const btn = fixture.nativeElement.querySelector(
      'button[title="Ver detalle"]'
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toEqual(mockSlot);
  });

  it("should emit edit when clicking edit button", () => {
    let emitted: SlotSummary | undefined;
    fixture.componentInstance.edit.subscribe(
      (val: SlotSummary) => (emitted = val)
    );

    /* SAFETY: The edit button is rendered in the component template */
    const btn = fixture.nativeElement.querySelector(
      'button[title="Editar"]'
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toEqual(mockSlot);
  });

  it("should emit changeStatus when clicking change status button", () => {
    let emitted: SlotSummary | undefined;
    fixture.componentInstance.changeStatus.subscribe(
      (val: SlotSummary) => (emitted = val)
    );

    /* SAFETY: The change status button is rendered in the component template */
    const btn = fixture.nativeElement.querySelector(
      'button[title="Cambiar estado"]'
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toEqual(mockSlot);
  });

  it("should emit delete when clicking delete button", () => {
    let emitted: SlotSummary | undefined;
    fixture.componentInstance.delete.subscribe(
      (val: SlotSummary) => (emitted = val)
    );

    /* SAFETY: The delete button is rendered in the component template */
    const btn = fixture.nativeElement.querySelector(
      'button[title="Eliminar"]'
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toEqual(mockSlot);
  });
});
