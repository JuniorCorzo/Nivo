import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { CheckInModalComponent } from "./check-in-modal";

interface MockTicketService {
  createTicket: ReturnType<typeof vi.fn>;
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, unknown[]>;
}

interface MockRateService {
  getRatesByParkingId: ReturnType<typeof vi.fn>;
  ratesByParking: () => Record<string, unknown[]>;
}

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
  parkingLots: () => unknown[];
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("CheckInModalComponent", () => {
  let component: CheckInModalComponent;
  let fixture: ComponentFixture<CheckInModalComponent>;
  let ticketServiceSpy: MockTicketService;
  let slotServiceSpy: MockSlotService;
  let rateServiceSpy: MockRateService;
  let parkingServiceSpy: MockParkingService;
  let toastSpy: MockToastService;

  beforeEach(async () => {
    ticketServiceSpy = { createTicket: vi.fn() };
    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
      summaries: () => ({ "p-1": [] }),
    };
    rateServiceSpy = {
      getRatesByParkingId: vi.fn().mockReturnValue(of([])),
      ratesByParking: () => ({ "p-1": [] }),
    };
    parkingServiceSpy = {
      getAll: vi.fn(),
      parkingLots: () => [],
    };
    toastSpy = { showToast: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CheckInModalComponent],
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInModalComponent);
    component = fixture.componentInstance;
  });

  it("should create CheckInModalComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should emit closed event when onClose is called", () => {
    const emitSpy = vi.spyOn(component.closed, "emit");
    component.onClose();
    expect(emitSpy).toHaveBeenCalled();
  });

  it("should update plate in facade on input event", () => {
    const input = document.createElement("input");
    input.value = "abc999";
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });
    component.onPlateInput(event);
    expect(component.facade.plate()).toBe("ABC999");
  });

  it("should update plate country in facade", () => {
    component.onPlateCountrySelect("UNPLATED");
    expect(component.facade.plateCountry()).toBe("UNPLATED");
    expect(component.facade.isUnplated()).toBe(true);
  });

  it("should update phone number in facade on input event", () => {
    const input = document.createElement("input");
    input.value = "3001234567";
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });
    component.onPhoneInput(event);
    expect(component.facade.phoneNumber()).toBe("3001234567");
  });

  it("should update photoUrl in facade on photoCaptured and photoCleared events", () => {
    component.onPhotoCaptured("data:image/jpeg;base64,captured");
    expect(component.facade.photoUrl()).toBe("data:image/jpeg;base64,captured");

    component.onPhotoCleared();
    expect(component.facade.photoUrl()).toBeNull();
  });
});
