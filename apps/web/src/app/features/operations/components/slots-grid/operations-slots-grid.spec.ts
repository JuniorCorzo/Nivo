import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { OperationsSlotsFilterAction } from "@core/models/operations-cockpit.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";

import { OperationsSlotsGridComponent } from "./operations-slots-grid";

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "s-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Central",
  prefix: "A",
  slotNumber: "1",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z1",
  ...overrides,
});

const createTicket = (
  overrides: Partial<TicketSummary> = {}
): TicketSummary => ({
  entryTime: "2026-10-16T10:00:00Z",
  id: "t-1",
  licensePlate: "AAA-111",
  slotNumber: "A-1",
  status: "OPEN",
  ...overrides,
});

describe("OperationsSlotsGridComponent", () => {
  let fixture: ComponentFixture<OperationsSlotsGridComponent>;
  let component: OperationsSlotsGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsSlotsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsSlotsGridComponent);
    component = fixture.componentInstance;
  });

  it("should resolve activeTicketsMap by slotId, prefix-slotNumber without cross-prefix collision, and num-slotNumber fallback", () => {
    const slotA1 = createSlot({
      id: "s-a1",
      prefix: "A",
      slotNumber: "1",
      status: "OCCUPIED",
    });
    const slotB1 = createSlot({
      id: "s-b1",
      prefix: "B",
      slotNumber: "1",
      status: "OCCUPIED",
    });
    const slotNoPrefix = createSlot({
      id: "s-np",
      prefix: "",
      slotNumber: "9",
      status: "OCCUPIED",
    });
    const slotById = createSlot({
      id: "s-id",
      prefix: "C",
      slotNumber: "5",
      status: "OCCUPIED",
    });

    fixture.componentRef.setInput("filteredSlots", [
      slotA1,
      slotB1,
      slotNoPrefix,
      slotById,
    ]);
    fixture.componentRef.setInput("activeTickets", [
      createTicket({ id: "t-a1", licensePlate: "CAR-A01", slotNumber: "A-1" }),
      createTicket({ id: "t-b1", licensePlate: "CAR-B01", slotNumber: "B-1" }),
      createTicket({ id: "t-np", licensePlate: "CAR-009", slotNumber: "9" }),
      createTicket({
        id: "t-id",
        licensePlate: "CAR-ID5",
        slotId: "s-id",
        slotNumber: "999",
      }),
    ]);
    fixture.detectChanges();

    expect(component.getActiveTicketForSlot(slotA1)?.licensePlate).toBe(
      "CAR-A01"
    );
    expect(component.getActiveTicketForSlot(slotB1)?.licensePlate).toBe(
      "CAR-B01"
    );
    expect(component.getActiveTicketForSlot(slotNoPrefix)?.licensePlate).toBe(
      "CAR-009"
    );
    expect(component.getActiveTicketForSlot(slotById)?.licensePlate).toBe(
      "CAR-ID5"
    );
  });

  it("should emit vehicle and status filter actions via Design System nv-button controls", () => {
    const filterEvents: OperationsSlotsFilterAction[] = [];
    component.filterAction.subscribe((e) => filterEvents.push(e));

    fixture.componentRef.setInput("filteredSlots", [createSlot()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rawButtonsOutsideDs = [...el.querySelectorAll("button")].filter(
      (b) => !b.hasAttribute("nv-button")
    );
    expect(rawButtonsOutsideDs).toEqual([]);

    const carsBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Carros")
    );
    const occupiedBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Ocupados")
    );

    carsBtn?.click();
    occupiedBtn?.click();

    expect(filterEvents).toEqual([
      { type: "vehicle", value: "CAR" },
      { type: "status", value: "OCCUPIED" },
    ]);
  });

  it("should emit slotClick for available and occupied slots and render empty state with reset action", () => {
    const clickedSlots: SlotSummary[] = [];
    const filterEvents: OperationsSlotsFilterAction[] = [];
    component.slotClick.subscribe((s) => clickedSlots.push(s));
    component.filterAction.subscribe((e) => filterEvents.push(e));

    const available = createSlot({ id: "s-avail", status: "AVAILABLE" });
    const occupied = createSlot({ id: "s-occ", status: "OCCUPIED" });
    fixture.componentRef.setInput("filteredSlots", [available, occupied]);
    fixture.detectChanges();

    const cards = (
      fixture.nativeElement as HTMLElement
    ).querySelectorAll<HTMLElement>("[role='button']");
    expect(cards.length).toBe(2);
    cards[0].click();
    cards[1].click();
    expect(clickedSlots.map((s) => s.id)).toEqual(["s-avail", "s-occ"]);

    // Empty state + reset button
    fixture.componentRef.setInput("filteredSlots", []);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      "No se encontraron bahías con los filtros seleccionados."
    );
    const resetBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Restablecer filtros")
    );
    resetBtn?.click();
    expect(filterEvents).toEqual([{ type: "reset" }]);
  });
});
