import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";

import { CheckOutFacade } from "../../../../facades/check-out.facade";
import { IdentificationStepComponent } from "./identification-step";

describe("IdentificationStepComponent", () => {
  let component: IdentificationStepComponent;
  let fixture: ComponentFixture<IdentificationStepComponent>;

  let mockSearchQuery: ReturnType<typeof signal<string>>;
  let mockIsLoadingOccupiedSlots: ReturnType<typeof signal<boolean>>;
  let mockIsLoadingTicket: ReturnType<typeof signal<boolean>>;
  let mockOccupiedSlots: ReturnType<typeof signal<SlotSummary[]>>;
  let mockFilteredOccupiedSlots: ReturnType<typeof signal<SlotSummary[]>>;
  let mockActiveTickets: ReturnType<typeof signal<TicketSummary[]>>;
  let mockFilteredTickets: ReturnType<typeof signal<TicketSummary[]>>;
  let selectSlotSpy: ReturnType<typeof vi.fn>;
  let selectTicketSpy: ReturnType<typeof vi.fn>;
  let setSearchQuerySpy: ReturnType<typeof vi.fn>;

  const sampleSlot: SlotSummary = {
    hasCharger: false,
    hasHistory: false,
    hasTicket: true,
    id: "slot-1",
    isAccessible: false,
    isActive: true,
    parkingName: "Parqueadero Central",
    prefix: "A",
    slotNumber: "01",
    status: "OCCUPIED",
    type: "CAR",
    zone: "Zona Norte",
  };

  const sampleTicket: TicketSummary = {
    entryTime: "2026-10-26T12:00:00Z",
    id: "ticket-101",
    licensePlate: "ABC-123",
    slotId: "slot-1",
    slotNumber: "01",
    slotType: "CAR",
    status: "OPEN",
  };

  beforeEach(async () => {
    mockSearchQuery = signal<string>("");
    mockIsLoadingOccupiedSlots = signal<boolean>(false);
    mockIsLoadingTicket = signal<boolean>(false);
    mockOccupiedSlots = signal<SlotSummary[]>([]);
    mockFilteredOccupiedSlots = signal<SlotSummary[]>([]);
    mockActiveTickets = signal<TicketSummary[]>([]);
    mockFilteredTickets = signal<TicketSummary[]>([]);

    selectSlotSpy = vi.fn();
    selectTicketSpy = vi.fn();
    setSearchQuerySpy = vi.fn((query: string) => {
      mockSearchQuery.set(query);
    });

    const mockFacade = {
      activeTickets: mockActiveTickets,
      filteredOccupiedSlots: mockFilteredOccupiedSlots,
      filteredTickets: mockFilteredTickets,
      isLoadingOccupiedSlots: mockIsLoadingOccupiedSlots,
      isLoadingTicket: mockIsLoadingTicket,
      occupiedSlots: mockOccupiedSlots,
      searchQuery: mockSearchQuery,
      selectSlot: selectSlotSpy,
      selectTicket: selectTicketSpy,
      setSearchQuery: setSearchQuerySpy,
    };

    await TestBed.configureTestingModule({
      imports: [IdentificationStepComponent],
      providers: [{ provide: CheckOutFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentificationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create IdentificationStepComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render search input and react to user input", () => {
    /* SAFETY: Search input is present in template as HTMLInputElement inside nv-input */
    const input = fixture.nativeElement.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toContain("Buscar por placa");

    input.value = "XYZ-999";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(setSearchQuerySpy).toHaveBeenCalledWith("XYZ-999");
  });

  it("should clear search query when clear button is clicked", () => {
    mockSearchQuery.set("ABC");
    fixture.detectChanges();

    /* SAFETY: Clear button is rendered when searchQuery is non-empty */
    const clearBtn = fixture.nativeElement.querySelector(
      '[title="Limpiar búsqueda"]'
    ) as HTMLElement;
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(setSearchQuerySpy).toHaveBeenCalledWith("");
  });

  it("should display filtered tickets when license plate matches and select on click", () => {
    mockSearchQuery.set("ABC");
    mockFilteredTickets.set([sampleTicket]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("ABC-123");
    expect(text).toContain("Cupo 01");

    /* SAFETY: Ticket item is a clickable button element */
    const ticketBtn = fixture.nativeElement.querySelector(
      "button.group"
    ) as HTMLButtonElement;
    expect(ticketBtn).toBeTruthy();

    ticketBtn.click();
    expect(selectTicketSpy).toHaveBeenCalledWith(sampleTicket);
  });

  it("should display empty search state when query has no matches", () => {
    mockSearchQuery.set("NOTFOUND");
    mockFilteredTickets.set([]);
    mockFilteredOccupiedSlots.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("No se encontró ningún vehículo con esa placa");
  });

  it("should display occupied slots in grid and call facade.selectSlot on click when not searching", () => {
    mockSearchQuery.set("");
    mockOccupiedSlots.set([sampleSlot]);
    mockFilteredOccupiedSlots.set([sampleSlot]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("A-01");
    expect(text).toContain("Zona Norte");

    /* SAFETY: Slot card is a button element with class group */
    const slotBtn = fixture.nativeElement.querySelector(
      "button.group"
    ) as HTMLButtonElement;
    expect(slotBtn).toBeTruthy();

    slotBtn.click();
    expect(selectSlotSpy).toHaveBeenCalledWith(sampleSlot);
  });

  it("should display empty state when not searching and there are no occupied slots", () => {
    mockSearchQuery.set("");
    mockOccupiedSlots.set([]);
    mockFilteredOccupiedSlots.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("No hay vehículos para retirar");
  });
});
