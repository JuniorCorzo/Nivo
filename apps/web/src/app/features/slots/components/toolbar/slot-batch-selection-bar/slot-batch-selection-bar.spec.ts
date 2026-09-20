import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotBatchSelectionBarComponent } from "./slot-batch-selection-bar";

describe("SlotBatchSelectionBarComponent", () => {
  let fixture: ComponentFixture<SlotBatchSelectionBarComponent>;
  let component: SlotBatchSelectionBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotBatchSelectionBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotBatchSelectionBarComponent);
    component = fixture.componentInstance;
  });

  it("should not render anything when selectedCount is 0", () => {
    fixture.componentRef.setInput("selectedCount", 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe("");
  });

  it("should render selection count and action buttons when selectedCount > 0", () => {
    fixture.componentRef.setInput("selectedCount", 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("3 plazas seleccionadas");
    expect(fixture.nativeElement.textContent).toContain("Editar equipamiento (3)");
    expect(fixture.nativeElement.textContent).toContain("Eliminar");
  });

  it("should emit editMetadata on click", () => {
    let emitted = false;
    component.editMetadata.subscribe(() => (emitted = true));

    fixture.componentRef.setInput("selectedCount", 2);
    fixture.detectChanges();

    /* SAFETY: nv-button is rendered when selectedCount > 0 */
    const editBtn = fixture.nativeElement.querySelector("nv-button") as HTMLElement;
    editBtn.click();

    expect(emitted).toBe(true);
  });

  it("should emit deleteBatch on click", () => {
    let emitted = false;
    component.deleteBatch.subscribe(() => (emitted = true));

    fixture.componentRef.setInput("selectedCount", 2);
    fixture.detectChanges();

    /* SAFETY: Destructive action button is rendered when selectedCount > 0 */
    const deleteBtn = fixture.nativeElement.querySelector(
      "button.bg-destructive",
    ) as HTMLButtonElement;
    deleteBtn.click();

    expect(emitted).toBe(true);
  });
});
