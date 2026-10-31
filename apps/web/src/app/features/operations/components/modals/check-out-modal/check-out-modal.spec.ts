import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { CheckOutModalComponent } from "./check-out-modal";

interface MockTicketService {
  calculatePrice: ReturnType<typeof vi.fn>;
  checkOutVehicle: ReturnType<typeof vi.fn>;
  getActiveTicketBySlot: ReturnType<typeof vi.fn>;
  listTicketsByParkingLot: ReturnType<typeof vi.fn>;
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, unknown[]>;
}

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
  parkingLots: () => unknown[];
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("CheckOutModalComponent", () => {
  let component: CheckOutModalComponent;
  let fixture: ComponentFixture<CheckOutModalComponent>;
  let ticketServiceSpy: MockTicketService;
  let slotServiceSpy: MockSlotService;
  let parkingServiceSpy: MockParkingService;
  let toastSpy: MockToastService;

  beforeEach(async () => {
    ticketServiceSpy = {
      calculatePrice: vi.fn().mockReturnValue(
        of({
          breakdown: [
            { amount: 3000, concept: "Hora Inicial" },
            { amount: 2000, concept: "Hora Adicional" },
          ],
          ivaAmount: 950,
          ivaRate: 19,
          name: "Standard",
          subtotal: 5000,
          total: 5950,
        })
      ),
      checkOutVehicle: vi.fn().mockReturnValue(of({})),
      getActiveTicketBySlot: vi.fn().mockReturnValue(
        of({
          entryTime: "2026-08-27T10:00:00Z",
          id: "ticket-1",
          licensePlate: "ABC123",
          status: "OPEN",
        })
      ),
      listTicketsByParkingLot: vi.fn().mockReturnValue(of([])),
    };
    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
      summaries: () => ({}),
    };
    parkingServiceSpy = {
      getAll: vi.fn(),
      parkingLots: () => [],
    };
    toastSpy = { showToast: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CheckOutModalComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckOutModalComponent);
    component = fixture.componentInstance;
  });

  it("should create CheckOutModalComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should emit closed when onClose is called", () => {
    const emitSpy = vi.spyOn(component.closed, "emit");
    component.onClose();
    expect(emitSpy).toHaveBeenCalled();
  });

  it("should delegate confirm checkout to facade", () => {
    const confirmSpy = vi.spyOn(component.facade, "confirmCheckOut");
    component.onConfirmCheckOut();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it("should display empty state when there are no occupied slots", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.detectChanges();

    const emptyText = fixture.nativeElement.textContent;
    expect(emptyText).toContain("No hay vehículos para retirar");
  });

  it("should display occupied slots when available and call facade.selectSlot when clicked", () => {
    const occupiedSlot = {
      hasHistory: false,
      hasTicket: true,
      id: "slot-1",
      parkingName: "Parking 1",
      prefix: "A",
      slotNumber: "01",
      status: "OCCUPIED",
      type: "CAR",
      zone: "Z1",
    };
    slotServiceSpy.summaries = () => ({ "parking-1": [occupiedSlot] });
    const selectSlotSpy = vi.spyOn(component.facade, "selectSlot");

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.detectChanges();

    const emptyText = fixture.nativeElement.textContent;
    expect(emptyText).not.toContain("No hay vehículos para retirar");
    expect(emptyText).toContain("A-01");

    /* SAFETY: The slot item rendered is a button HTML element */
    const slotBtn = fixture.nativeElement.querySelector(
      "button.group"
    ) as HTMLButtonElement;
    expect(slotBtn).toBeTruthy();
    slotBtn.click();
    expect(selectSlotSpy).toHaveBeenCalledWith(occupiedSlot);
  });

  it("should filter tickets when search query is entered and select on click", () => {
    const activeTicket = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-1",
      licensePlate: "ABC123",
      slotId: "slot-1",
      slotNumber: "01",
      status: "OPEN" as const,
    };
    ticketServiceSpy.listTicketsByParkingLot.mockReturnValue(
      of([activeTicket])
    );
    const selectTicketSpy = vi.spyOn(component.facade, "selectTicket");

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.detectChanges();

    component.facade.setSearchQuery("ABC");
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("ABC123");

    /* SAFETY: The ticket item rendered in search results is a button HTML element */
    const ticketBtn = fixture.nativeElement.querySelector(
      "button.group"
    ) as HTMLButtonElement;
    expect(ticketBtn).toBeTruthy();
    ticketBtn.click();
    expect(selectTicketSpy).toHaveBeenCalledWith(activeTicket);
  });

  it("should render step indicator header with 3 steps", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Identificación");
    expect(text).toContain("Liquidación");
    expect(text).toContain("Pago");
  });

  it("should transition to Step 2 when ticket is selected and render SettlementStepComponent", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const ticket: TicketSummary = {
      entryTime: "2026-10-26T10:00:00Z",
      id: "ticket-1",
      licensePlate: "XYZ-999",
      slotNumber: "B-05",
      status: "OPEN",
    };

    component.facade.selectTicket(ticket);
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(2);
    const settlementStepEl = fixture.nativeElement.querySelector(
      "app-settlement-step"
    );
    expect(settlementStepEl).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("XYZ-999");
    expect(fixture.nativeElement.textContent).toContain("B-05");
  });

  it("should advance from Step 2 to Step 3 and show payment controls", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const ticket: TicketSummary = {
      entryTime: "2026-10-26T10:00:00Z",
      id: "ticket-1",
      licensePlate: "XYZ-999",
      slotNumber: "B-05",
      status: "OPEN",
    };

    component.facade.selectTicket(ticket);
    fixture.detectChanges();

    component.facade.proceedToPayment();
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(3);
    expect(
      fixture.nativeElement.querySelector("app-payment-step")
    ).toBeTruthy();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Método de Pago");
    expect(text).toContain("Envío de Comprobante");
    expect(text).toContain("Volver a Liquidación");
    expect(text).toContain("Cobrar y Registrar Salida");
  });

  it("should complete full multi-step flow from Step 1 through Step 3 and open receipt", () => {
    ticketServiceSpy.checkOutVehicle.mockReturnValue(
      of({
        amount: 5950,
        id: "pay-1",
        paymentMethod: "EFFECTIVE",
        status: "APPROVED",
      })
    );

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.detectChanges();

    // Step 1: Identification
    expect(component.facade.activeStep()).toBe(1);
    expect(
      fixture.nativeElement.querySelector("app-identification-step")
    ).toBeTruthy();

    const ticket: TicketSummary = {
      entryTime: "2026-10-26T10:00:00Z",
      id: "ticket-1",
      licensePlate: "XYZ-999",
      slotNumber: "B-05",
      status: "OPEN",
    };

    // Step 2: Settlement
    component.facade.selectTicket(ticket);
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(2);
    expect(
      fixture.nativeElement.querySelector("app-settlement-step")
    ).toBeTruthy();

    // Step 3: Payment
    component.facade.proceedToPayment();
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(3);
    const paymentStepEl =
      fixture.nativeElement.querySelector("app-payment-step");
    expect(paymentStepEl).toBeTruthy();

    // Select Tarjeta / Datáfono and confirm checkout
    component.facade.setPaymentMethod("PAY_LINK");
    fixture.detectChanges();

    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes(
        "Cobrar y Registrar Salida"
      )
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    fixture.detectChanges();

    expect(ticketServiceSpy.checkOutVehicle).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: "PAY_LINK",
        ticketId: "ticket-1",
      })
    );
    expect(component.facade.isReceiptOpen()).toBe(true);
  });

  it("should go back from Step 3 to Step 2 when 'Volver a Liquidación' is clicked", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const ticket: TicketSummary = {
      entryTime: "2026-10-26T10:00:00Z",
      id: "ticket-1",
      licensePlate: "XYZ-999",
      slotNumber: "B-05",
      status: "OPEN",
    };

    component.facade.selectTicket(ticket);
    component.facade.proceedToPayment();
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(3);

    /* SAFETY: Back button contains 'Volver a Liquidación' text */
    const backBtn = Array.from(
      fixture.nativeElement.querySelectorAll("button")
    ).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Volver a Liquidación")
    ) as HTMLButtonElement;
    expect(backBtn).toBeTruthy();

    backBtn.click();
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(2);
    expect(
      fixture.nativeElement.querySelector("app-settlement-step")
    ).toBeTruthy();
  });

  it("should return to Step 1 when clearSelectedTicket is called", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const ticket: TicketSummary = {
      entryTime: "2026-10-26T10:00:00Z",
      id: "ticket-1",
      licensePlate: "XYZ-999",
      status: "OPEN",
    };

    component.facade.selectTicket(ticket);
    fixture.detectChanges();
    expect(component.facade.activeStep()).toBe(2);

    component.facade.clearSelectedTicket();
    fixture.detectChanges();

    expect(component.facade.activeStep()).toBe(1);
    expect(component.facade.selectedTicket()).toBeNull();
    expect(
      fixture.nativeElement.querySelector("app-identification-step")
    ).toBeTruthy();
  });

  it("should render 'SIN PLACA' badge when vehicle has plateCountry UNPLATED", () => {
    const unplatedTicket: TicketSummary = {
      id: "ticket-unplated-1",
      licensePlate: "SP-1001",
      plateCountry: "UNPLATED",
      slotNumber: "02",
      entryTime: "2026-08-27T10:00:00Z",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("ticket", unplatedTicket);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const badge = nativeEl.querySelector("nv-badge[variant='warning']");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain("SIN PLACA");
    expect(nativeEl.textContent).toContain("SP-1001");
  });

  it("should render captured entry photo when ticket has photoUrl", () => {
    const ticketWithPhoto: TicketSummary = {
      id: "ticket-photo-1",
      licensePlate: "SP-1002",
      plateCountry: "UNPLATED",
      photoUrl: "https://example.com/captured-entry.jpg",
      slotNumber: "03",
      entryTime: "2026-08-27T10:00:00Z",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("ticket", ticketWithPhoto);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const photoImg = nativeEl.querySelector(
      "img[src='https://example.com/captured-entry.jpg']"
    ) as HTMLImageElement;
    expect(photoImg).toBeTruthy();
    expect(photoImg.getAttribute("alt")).toBe(
      "Fotografía capturada al ingreso"
    );
    expect(nativeEl.textContent).toContain("Fotografía de ingreso");
  });

  it("should not render photo container when ticket does not have photoUrl", () => {
    const ticketWithoutPhoto: TicketSummary = {
      id: "ticket-standard-1",
      licensePlate: "XYZ789",
      plateCountry: "CO",
      slotNumber: "04",
      entryTime: "2026-08-27T10:00:00Z",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("ticket", ticketWithoutPhoto);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const photoImg = nativeEl.querySelector(
      "img[alt='Fotografía capturada al ingreso']"
    );
    expect(photoImg).toBeNull();
    expect(nativeEl.textContent).not.toContain("Fotografía de ingreso");
    const badge = nativeEl.querySelector("nv-badge[variant='warning']");
    expect(badge).toBeNull();
  });

  it("should render 0% IVA line when IVA rate is configured to 0%", () => {
    ticketServiceSpy.calculatePrice.mockReturnValue(
      of({
        breakdown: [],
        ivaAmount: 0,
        ivaRate: 0,
        name: "Standard",
        subtotal: 5000,
        total: 5000,
      })
    );
    const ticket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-zero-iva",
      licensePlate: "IVA000",
      plateCountry: "CO",
      slotNumber: "05",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("ticket", ticket);
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.textContent).toContain("IVA (0%)");
  });
});
