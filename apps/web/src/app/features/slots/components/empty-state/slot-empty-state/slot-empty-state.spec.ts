import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotEmptyStateComponent } from "./slot-empty-state";

describe("SlotEmptyStateComponent", () => {
  let fixture: ComponentFixture<SlotEmptyStateComponent>;
  let component: SlotEmptyStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotEmptyStateComponent);
    component = fixture.componentInstance;
  });

  it("should show 'No hay plazas configuradas' when hasSlots is false", () => {
    fixture.componentRef.setInput("hasSlots", false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      "No hay plazas configuradas"
    );
    expect(fixture.nativeElement.textContent).toContain("Crear primer lote");
  });

  it("should emit create when clicking 'Crear primer lote'", () => {
    let emitted = false;
    component.create.subscribe(() => (emitted = true));

    fixture.componentRef.setInput("hasSlots", false);
    fixture.detectChanges();

    /* SAFETY: The action button is rendered in the template when hasSlots is false */
    const btn = fixture.nativeElement.querySelector(
      "button"
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toBe(true);
  });

  it("should show 'Ninguna plaza coincide' when hasSlots is true", () => {
    fixture.componentRef.setInput("hasSlots", true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      "Ninguna plaza coincide"
    );
    expect(fixture.nativeElement.textContent).toContain("Limpiar filtros");
  });

  it("should emit clearFilters when clicking 'Limpiar filtros'", () => {
    let emitted = false;
    component.clearFilters.subscribe(() => (emitted = true));

    fixture.componentRef.setInput("hasSlots", true);
    fixture.detectChanges();

    /* SAFETY: The clear filters button is rendered in the template when hasSlots is true */
    const btn = fixture.nativeElement.querySelector(
      "button"
    ) as HTMLButtonElement;
    btn.click();

    expect(emitted).toBe(true);
  });
});
