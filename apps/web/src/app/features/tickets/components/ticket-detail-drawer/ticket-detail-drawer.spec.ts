import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { PriceDetailedModel, TicketSummary } from "@core/models/ticket.model";

import { TicketDetailDrawerComponent } from "./ticket-detail-drawer";

describe("TicketDetailDrawerComponent", () => {
  let component: TicketDetailDrawerComponent;
  let fixture: ComponentFixture<TicketDetailDrawerComponent>;

  const mockOpenTicket: TicketSummary = {
    entryTime: "2026-09-05T10:00:00Z",
    id: "ticket-100",
    licensePlate: "AAA111",
    rateName: "Tarifa Principal",
    slotNumber: "S-1",
    slotType: "CAR",
    status: "OPEN",
  };

  const mockLiveRate: PriceDetailedModel = {
    breakdown: [{ amount: 3000, concept: "1 hora" }],
    ivaAmount: 570,
    ivaRate: 19,
    name: "Tarifa Principal",
    subtotal: 3000,
    total: 3570,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailDrawerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("ticket", mockOpenTicket);
    fixture.componentRef.setInput("liveRate", mockLiveRate);
    fixture.componentRef.setInput("isLoadingRate", false);
    fixture.detectChanges();
  });

  it("should render open ticket details and live rate calculation", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("AAA111");
    expect(compiled.textContent).toContain("Tarifa Principal");
    expect(compiled.textContent).toContain("Total Estimado a Cobrar:");
    expect(compiled.textContent).toContain("3,570");
  });

  it("should emit close output when escape key is pressed", () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(closed).toBe(true);
  });

  it("should emit reprintReceipt output with current ticket", () => {
    let emittedTicket: TicketSummary | null = null;
    component.reprintReceipt.subscribe((t) => {
      emittedTicket = t;
    });

    component.reprintReceipt.emit(mockOpenTicket);
    expect(emittedTicket).toEqual(mockOpenTicket);
  });

  it("should render finalized payment details for closed ticket", () => {
    const closedTicket: TicketSummary = {
      entryTime: "2026-09-05T08:00:00Z",
      exitTime: "2026-09-05T09:30:00Z",
      id: "ticket-200",
      licensePlate: "BBB222",
      paymentMethod: "EFECTIVO",
      status: "CLOSED",
      totalToCharge: 5000,
      transactionReference: "REF-999",
    };

    fixture.componentRef.setInput("ticket", closedTicket);
    fixture.componentRef.setInput("liveRate", null);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Detalle de Pago Finalizado");
    expect(compiled.textContent).toContain("5,000");
    expect(compiled.textContent).toContain("EFECTIVO");
    expect(compiled.textContent).toContain("REF-999");
  });
});
