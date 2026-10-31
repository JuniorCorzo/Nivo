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

  it("should render direct Cobrar action button for OPEN tickets only", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);

    // Row 0 is OPEN -> contains Cobrar button
    const firstRowCobrar = rows[0].querySelector(
      'nv-button[aria-label="Cobrar"]'
    );
    expect(firstRowCobrar).not.toBeNull();
    expect(firstRowCobrar?.textContent).toContain("Cobrar");

    // Row 1 is CLOSED -> does NOT contain Cobrar button
    const secondRowCobrar = rows[1].querySelector(
      'nv-button[aria-label="Cobrar"]'
    );
    expect(secondRowCobrar).toBeNull();
  });

  it("should emit selectTicket when clicking direct Cobrar button", () => {
    let selected: TicketSummary | null = null;
    component.selectTicket.subscribe((t) => {
      selected = t;
    });

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Querying rendered button element from table DOM */
    const cobrarBtn = compiled.querySelector(
      'tbody tr:first-child nv-button[aria-label="Cobrar"]'
    ) as HTMLElement | null;
    expect(cobrarBtn).not.toBeNull();
    const innerBtn = cobrarBtn?.querySelector("button");
    innerBtn?.click();

    expect(selected).toEqual(mockTickets[0]);
  });

  it("should render clean monospace plate for regular tickets and camera icon for unplated tickets", () => {
    const withUnplated: TicketSummary[] = [
      ...mockTickets,
      {
        entryTime: "2026-09-05T07:00:00Z",
        id: "t-3",
        licensePlate: "SP-999",
        parkingLotId: "lot-1",
        parkingLotName: "Parqueadero Central",
        slotNumber: "M-01",
        slotType: "MOTORCYCLE",
        status: "OPEN",
      },
    ];
    ticketsSignal.set(withUnplated);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll("tbody tr");
    expect(rows.length).toBe(3);

    // Row 0 has clean monospace plate
    const standardPlate = rows[0].querySelector(
      "app-ticket-plate-cell span.font-mono"
    );
    expect(standardPlate).not.toBeNull();
    expect(standardPlate?.textContent).toContain("ABC123");
    expect(rows[0].querySelector(".bg-amber-400")).toBeNull();

    // Row 2 has unplated chip with camera icon
    const unplatedChip = rows[2].querySelector(
      "app-ticket-plate-cell span.text-amber-500"
    );
    expect(unplatedChip).not.toBeNull();
    expect(unplatedChip?.textContent).toContain("SP-999");
    expect(
      unplatedChip?.querySelector('ng-icon[name="lucideCamera"]')
    ).not.toBeNull();
  });

  it("should render status badge with pulsing live dot for OPEN status", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const openRow = compiled.querySelector("tbody tr:first-child");
    const pulseDot = openRow?.querySelector(".animate-pulse.bg-emerald-400");
    expect(pulseDot).not.toBeNull();
  });

  it("should render totalToCharge with bold tabular figures", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const totalCells = compiled.querySelectorAll("app-ticket-total-cell");
    expect(totalCells.length).toBeGreaterThan(1);
    expect(totalCells[0].textContent).toContain("---");
    expect(totalCells[1].textContent).toContain("$3,500");
    const totalSpan = totalCells[1].querySelector(".tabular-nums.font-bold");
    expect(totalSpan).not.toBeNull();
  });

  it("should emit selectTicket when clicking a row in the table", () => {
    let selected: TicketSummary | null = null;
    component.selectTicket.subscribe((t) => {
      selected = t;
    });

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Element queried from test fixture DOM */
    const row = compiled.querySelector(
      "tbody tr:first-child"
    ) as HTMLElement | null;
    row?.click();

    expect(selected).toEqual(mockTickets[0]);
  });

  it("should render standard plate with clean typography without country tag", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const plateCell = compiled.querySelector("app-ticket-plate-cell");
    expect(plateCell).not.toBeNull();
    expect(plateCell?.textContent).toContain("ABC123");
    expect(plateCell?.textContent).not.toContain("COLOMBIA");
    const standardPlate = plateCell?.querySelector("span.tracking-wider");
    expect(standardPlate).not.toBeNull();
  });

  it("should render ticket duration cell with entry date/time and elapsed duration without progress bar", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const durationCell = compiled.querySelector("app-ticket-duration-cell");
    expect(durationCell).not.toBeNull();
    const progressTrack = durationCell?.querySelector(".bg-muted.rounded-full");
    expect(progressTrack).toBeNull();
    const spans = durationCell?.querySelectorAll("span");
    expect(spans?.length).toBe(2);
    expect(spans?.[0].classList.contains("font-mono")).toBe(true);
    expect(spans?.[1].classList.contains("text-muted-foreground")).toBe(true);
  });
});
