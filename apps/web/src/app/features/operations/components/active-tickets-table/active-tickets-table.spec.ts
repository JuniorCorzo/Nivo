import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";

import { OperationsActiveTicketsTableComponent } from "./active-tickets-table";

const createTicket = (
  overrides: Partial<TicketSummary> = {}
): TicketSummary => ({
  entryTime: "2026-10-16T10:00:00Z",
  id: "t-1",
  licensePlate: "ABC-123",
  plateCountry: "CO",
  slotNumber: "101",
  slotType: "CAR",
  status: "OPEN",
  ...overrides,
});

describe("OperationsActiveTicketsTableComponent", () => {
  let fixture: ComponentFixture<OperationsActiveTicketsTableComponent>;
  let component: OperationsActiveTicketsTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsActiveTicketsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsActiveTicketsTableComponent);
    component = fixture.componentInstance;
  });

  it("should render active tickets with country badges and emit checkOutWithTicket on row action click", () => {
    const selected: TicketSummary[] = [];
    component.checkOutWithTicket.subscribe((t) => selected.push(t));

    const tickets = [
      createTicket({
        id: "t-1",
        licensePlate: "ABC-123",
        plateCountry: "CO",
        slotNumber: "101",
      }),
      createTicket({
        id: "t-2",
        licensePlate: "SIN-PLACA",
        plateCountry: "UNPLATED",
        slotNumber: "102",
      }),
    ];
    fixture.componentRef.setInput("filteredActiveTickets", tickets);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("ABC-123");
    expect(el.textContent).toContain("Bahía 101");
    expect(el.textContent).toContain("SP");

    const rowButtons = [
      ...el.querySelectorAll<HTMLButtonElement>("tbody button"),
    ];
    expect(rowButtons.length).toBe(2);
    rowButtons[0].click();
    expect(selected).toEqual([tickets[0]]);
  });

  it("should emit searchTicketQueryChange on input/clear, submitExpressCheckOut on Enter, and openQrScanner on QR button click", () => {
    const queries: string[] = [];
    let checkoutCount = 0;
    let qrCount = 0;
    component.searchTicketQueryChange.subscribe((q) => queries.push(q));
    component.submitExpressCheckOut.subscribe(() => {
      checkoutCount += 1;
    });
    component.openQrScanner.subscribe(() => {
      qrCount += 1;
    });

    fixture.componentRef.setInput("filteredActiveTickets", [createTicket()]);
    fixture.componentRef.setInput("searchTicketQuery", "ABC");
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // All buttons must be Design System nv-button
    const rawButtonsOutsideDs = [...el.querySelectorAll("button")].filter(
      (b) => !b.hasAttribute("nv-button")
    );
    expect(rawButtonsOutsideDs).toEqual([]);

    const searchInput = el.querySelector<HTMLInputElement>(
      "#search-ticket-mobile"
    );
    expect(searchInput).toBeTruthy();
    if (searchInput) {
      searchInput.value = "XYZ";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
      );
    }

    const clearBtn = el.querySelector<HTMLElement>(
      '[aria-label="Limpiar búsqueda"]'
    );
    clearBtn?.click();

    const qrBtn = [...el.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Escanear QR")
    );
    qrBtn?.click();

    expect(queries).toEqual(["XYZ", ""]);
    expect(checkoutCount).toBe(1);
    expect(qrCount).toBe(1);
  });

  it("should render empty state when filteredActiveTickets is empty", () => {
    fixture.componentRef.setInput("filteredActiveTickets", []);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(
      "No hay vehículos activos en este momento."
    );
    expect(el.querySelector("table")).toBeNull();
  });
});
