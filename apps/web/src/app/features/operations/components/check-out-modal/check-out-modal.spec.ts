import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
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
          breakdown: [],
          ivaAmount: 0,
          ivaRate: 0,
          name: "Standard",
          subtotal: 5000,
          total: 5000,
        }),
      ),
      checkOutVehicle: vi.fn().mockReturnValue(of({})),
      getActiveTicketBySlot: vi.fn().mockReturnValue(
        of({
          entryTime: "2026-08-27T10:00:00Z",
          id: "ticket-1",
          licensePlate: "ABC123",
          status: "OPEN",
        }),
      ),
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
    const slotBtn = fixture.nativeElement.querySelector("button.group") as HTMLButtonElement;
    expect(slotBtn).toBeTruthy();
    slotBtn.click();
    expect(selectSlotSpy).toHaveBeenCalledWith(occupiedSlot);
  });
});
