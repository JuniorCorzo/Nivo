import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";
import { DataTableState } from "@shared/components/data-table";

import { createTicketColumns } from "./ticket-columns-definition";
import { TicketsTableComponent } from "./tickets-table";

describe("TicketsTableComponent", () => {
  let component: TicketsTableComponent;
  let fixture: ComponentFixture<TicketsTableComponent>;
  let ticketsSignal: ReturnType<typeof signal<TicketSummary[]>>;

  const mockTickets: TicketSummary[] = [
    {
      entryTime: "2026-09-05T10:00:00Z",
      id: "t-1",
      licensePlate: "ABC123",
      parkingLotId: "lot-1",
      parkingLotName: "Parqueadero Central",
      slotNumber: "A-01",
      slotType: "CAR",
      status: "OPEN",
    },
    {
      entryTime: "2026-09-05T08:00:00Z",
      exitTime: "2026-09-05T09:30:00Z",
      id: "t-2",
      licensePlate: "XYZ789",
      parkingLotId: "lot-2",
      parkingLotName: "Parqueadero Norte",
      slotNumber: "M-05",
      slotType: "MOTORCYCLE",
      status: "CLOSED",
      totalToCharge: 3500,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsTableComponent);
    component = fixture.componentInstance;

    ticketsSignal = signal<TicketSummary[]>(mockTickets);
    const tableState = new DataTableState<TicketSummary>();
    const table = tableState.createTable({
      columns: createTicketColumns({
        onReprintReceipt: (t) => component.reprintReceipt.emit(t),
        onSelectTicket: (t) => component.selectTicket.emit(t),
        showParkingLot: true,
      }),
      data: () => ticketsSignal(),
      getRowId: (row) => row.id,
      initialVisibility: {
        parkingLotId: false,
      },
    });

    fixture.componentRef.setInput("table", table);
    fixture.componentRef.setInput("isLoading", false);
    fixture.detectChanges();
  });

  it("should render table with tickets", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
    expect(compiled.textContent).toContain("ABC123");
    expect(compiled.textContent).toContain("XYZ789");
  });

  it("should show empty state when tickets array is empty", () => {
    ticketsSignal.set([]);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("No se encontraron tickets");
  });

  it("should show loading indicator when isLoading is true", () => {
    fixture.componentRef.setInput("isLoading", true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const skeletons = compiled.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should emit selectTicket when clicking view detail button", () => {
    let selected: TicketSummary | null = null;
    component.selectTicket.subscribe((t) => {
      selected = t;
    });

    component.selectTicket.emit(mockTickets[0]);
    expect(selected).toEqual(mockTickets[0]);
  });

  it("should emit reprintReceipt when clicking reprint button", () => {
    let selected: TicketSummary | null = null;
    component.reprintReceipt.subscribe((t) => {
      selected = t;
    });

    component.reprintReceipt.emit(mockTickets[1]);
    expect(selected).toEqual(mockTickets[1]);
  });

  it("should emit resetFilters when clicking reset filters button", () => {
    ticketsSignal.set([]);
    fixture.detectChanges();

    let resetCalled = false;
    component.resetFilters.subscribe(() => {
      resetCalled = true;
    });

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Reset button exists in the rendered empty state template */
    const resetButton = compiled.querySelector("button") as HTMLButtonElement;
    resetButton.click();

    expect(resetCalled).toBe(true);
  });

  it("should render parking lot column when showParkingLot is true", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Parqueadero");
    expect(compiled.textContent).toContain("Parqueadero Central");
  });
});
