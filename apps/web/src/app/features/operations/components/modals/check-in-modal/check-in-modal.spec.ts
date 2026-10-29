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

  it("should apply plate mask directive formatting on plate input", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();
    const input: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#plate-input");
    expect(input).not.toBeNull();
    if (!input) {
      return;
    }
    input.value = "abc123";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe("ABC-123");
    expect(component.facade.plate()).toBe("ABC-123");
  });

  it("should auto-detect Venezuelan plate and update facade plate and country", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();
    const input: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#plate-input");
    expect(input).not.toBeNull();
    if (!input) {
      return;
    }
    input.value = "ab123cd";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe("AB-123-CD");
    expect(component.facade.plate()).toBe("AB-123-CD");
    expect(component.facade.plateCountry()).toBe("VE");
  });

  it("should auto-detect Colombian plate and update facade plate and country", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();
    const input: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#plate-input");
    expect(input).not.toBeNull();
    if (!input) {
      return;
    }
    input.value = "abc123";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(input.value).toBe("ABC-123");
    expect(component.facade.plate()).toBe("ABC-123");
    expect(component.facade.plateCountry()).toBe("CO");
  });

  it("should toggle modality between plated and unplated", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    component.facade.setIsUnplated(true);
    fixture.detectChanges();

    expect(component.facade.isUnplated()).toBe(true);
    const photoCapture =
      fixture.nativeElement.querySelector("app-photo-capture");
    expect(photoCapture).not.toBeNull();

    component.facade.setIsUnplated(false);
    fixture.detectChanges();

    expect(component.facade.isUnplated()).toBe(false);
    const plateInput = fixture.nativeElement.querySelector("#plate-input");
    expect(plateInput).not.toBeNull();
  });

  it("should update country on onCountryChange", () => {
    component.onCountryChange("VE");
    expect(component.facade.plateCountry()).toBe("VE");

    component.onCountryChange("CO");
    expect(component.facade.plateCountry()).toBe("CO");
  });

  it("should pre-set vehicle type and slotId in facade and render banner when preselectedSlot is provided on open", () => {
    const mockSlot = {
      id: "slot-custom-1",
      parkingName: "Central",
      prefix: "A",
      slotNumber: "101",
      status: "AVAILABLE" as const,
      type: "MOTORCYCLE" as const,
      zone: "Z1",
    };
    const setVehicleTypeSpy = vi.spyOn(component.facade, "setVehicleType");
    const setSlotIdSpy = vi.spyOn(component.facade, "setSlotId");

    fixture.componentRef.setInput("preselectedSlot", mockSlot);
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    expect(setVehicleTypeSpy).toHaveBeenCalledWith("MOTORCYCLE");
    expect(setSlotIdSpy).toHaveBeenCalledWith("slot-custom-1");
    expect(fixture.nativeElement.textContent).toContain(
      "Bahía Asignada: A-101 (MOTORCYCLE)"
    );
  });

  it("should set unplated mode in facade when initialUnplated is true on open", () => {
    const setIsUnplatedSpy = vi.spyOn(component.facade, "setIsUnplated");

    fixture.componentRef.setInput("initialUnplated", true);
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    expect(setIsUnplatedSpy).toHaveBeenCalledWith(true);
    expect(component.facade.isUnplated()).toBe(true);
  });
});
