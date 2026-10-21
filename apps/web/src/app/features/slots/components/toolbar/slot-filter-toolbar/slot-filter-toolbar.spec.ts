import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { SlotFilterToolbarComponent } from "./slot-filter-toolbar";

describe("SlotFilterToolbarComponent", () => {
  let fixture: ComponentFixture<SlotFilterToolbarComponent>;
  let component: SlotFilterToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotFilterToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotFilterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render search input and 3 selects", () => {
    const searchInput = fixture.nativeElement.querySelector('input[type="search"]');
    const selects = fixture.nativeElement.querySelectorAll("nv-select");

    expect(searchInput).toBeTruthy();
    expect(selects.length).toBe(3);
  });

  it("should emit queryInput on input event", () => {
    let emittedEvent: Event | undefined;
    component.queryInput.subscribe((e: Event) => (emittedEvent = e));

    /* SAFETY: The search input is guaranteed to exist in the component template */
    const searchInput = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    const event = new Event("input", { bubbles: true });
    searchInput.dispatchEvent(event);

    expect(emittedEvent).toBe(event);
  });

  it("should emit filterChange when selects change", () => {
    const emissions: { key: string; value: unknown }[] = [];
    component.filterChange.subscribe((change: { key: string; value: unknown }) =>
      emissions.push(change),
    );

    component.onFilterChange("type", "CAR");
    component.onFilterChange("zone", "NORTE");
    component.onFilterChange("status", "AVAILABLE");

    expect(emissions).toEqual([
      { key: "type", value: "CAR" },
      { key: "zone", value: "NORTE" },
      { key: "status", value: "AVAILABLE" },
    ]);
  });

  it("should render quick filter buttons and clear button", () => {
    const buttons = [...fixture.nativeElement.querySelectorAll("nv-button")];
    /* SAFETY: nv-button elements in DOM are HTMLElements */
    const buttonTexts = buttons.map((b) => (b as HTMLElement).textContent?.trim() ?? "");

    expect(buttonTexts.some((t) => t.includes("Solo Discapacitados"))).toBe(true);
    expect(buttonTexts.some((t) => t.includes("Solo Eléctricos"))).toBe(true);
    expect(buttonTexts.some((t) => t.includes("Limpiar filtros"))).toBe(true);
  });

  it("should toggle isAccessible filter and emit filterChange", () => {
    const emissions: { key: string; value: unknown }[] = [];
    component.filterChange.subscribe((change) => emissions.push(change));

    component.toggleAccessible();
    expect(emissions).toEqual([{ key: "isAccessible", value: true }]);

    // simulate active
    fixture.componentRef.setInput("isAccessibleFilter", true);
    component.toggleAccessible();
    expect(emissions[1]).toEqual([{ key: "isAccessible", value: undefined }][0]);
  });

  it("should toggle hasCharger filter and emit filterChange", () => {
    const emissions: { key: string; value: unknown }[] = [];
    component.filterChange.subscribe((change) => emissions.push(change));

    component.toggleCharger();
    expect(emissions).toEqual([{ key: "hasCharger", value: true }]);

    // simulate active
    fixture.componentRef.setInput("hasChargerFilter", true);
    component.toggleCharger();
    expect(emissions[1]).toEqual([{ key: "hasCharger", value: undefined }][0]);
  });

  it("should emit clearFilters on clear button click", () => {
    let cleared = false;
    component.clearFilters.subscribe(() => (cleared = true));

    const buttons = [...fixture.nativeElement.querySelectorAll("nv-button")];
    /* SAFETY: Clear filter button exists in the template and is an HTMLElement */
    const clearBtn = buttons.find((b) =>
      /* SAFETY: nv-button element in DOM is an HTMLElement */
      (b as HTMLElement).textContent?.includes("Limpiar filtros"),
    ) as HTMLElement;

    expect(clearBtn).toBeTruthy();
    clearBtn.click();
    expect(cleared).toBe(true);
  });
});
