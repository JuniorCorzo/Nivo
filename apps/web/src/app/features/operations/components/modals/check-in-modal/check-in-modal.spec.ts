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

  it("should update phone number in facade on phoneChange event", () => {
    component.onPhoneChange("3001234567");
    expect(component.facade.phoneNumber()).toBe("3001234567");
  });

  it("should update email in facade on emailChange event", () => {
    component.onEmailChange("cliente@nivo.com");
    expect(component.facade.email()).toBe("cliente@nivo.com");
  });

  it("should update deliveryMethod in facade on deliveryChannelChange event", () => {
    component.onDeliveryChannelChange("EMAIL");
    expect(component.facade.deliveryMethod()).toBe("EMAIL");

    component.onDeliveryChannelChange("PRINT");
    expect(component.facade.deliveryMethod()).toBe("PRINT");

    component.onDeliveryChannelChange("WHATSAPP");
    expect(component.facade.deliveryMethod()).toBe("WHATSAPP");
  });

  it("should initialize photoUrl in facade when initialPhotoUrl and initialUnplated are provided", () => {
    fixture.componentRef.setInput("initialUnplated", true);
    fixture.componentRef.setInput(
      "initialPhotoUrl",
      "https://storage.nivo.dev/photos/bike-1.jpg"
    );
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    expect(component.facade.isUnplated()).toBe(true);
    expect(component.facade.photoUrl()).toBe(
      "https://storage.nivo.dev/photos/bike-1.jpg"
    );
  });

  it("should render license plate display for validation when initialPlate is provided", () => {
    fixture.componentRef.setInput("initialPlate", "ABC123");
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const plateDisplay = fixture.nativeElement.querySelector("#plate-display");
    expect(plateDisplay).not.toBeNull();
    expect(plateDisplay.textContent).toContain("ABC-123");
    expect(component.facade.plate()).toBe("ABC-123");
    expect(component.facade.plateCountry()).toBe("CO");
  });

  it("should auto-detect Venezuelan plate and update facade plate and country on initialPlate", () => {
    fixture.componentRef.setInput("initialPlate", "ab123cd");
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const plateDisplay = fixture.nativeElement.querySelector("#plate-display");
    expect(plateDisplay).not.toBeNull();
    expect(plateDisplay.textContent).toContain("AB-123-CD");
    expect(component.facade.plate()).toBe("AB-123-CD");
    expect(component.facade.plateCountry()).toBe("VE");
  });

  it("should not render vehicle type selector, modality buttons, or editable plate input for a clean flow", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const vehicleSelector = fixture.nativeElement.querySelector(
      '[aria-label="Seleccionar tipo de vehículo"]'
    );
    const modalityGroup = fixture.nativeElement.querySelector(
      '[aria-label="Modalidad de registro"]'
    );
    const plateInput = fixture.nativeElement.querySelector("#plate-input");

    expect(vehicleSelector).toBeNull();
    expect(modalityGroup).toBeNull();
    expect(plateInput).toBeNull();
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

  it("should render ticket-delivery-card component in the delivery section", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const deliveryCard = fixture.nativeElement.querySelector(
      "app-ticket-delivery-card"
    );
    expect(deliveryCard).not.toBeNull();

    const phoneInput = fixture.nativeElement.querySelector(
      "#delivery-phone-input"
    );
    expect(phoneInput).not.toBeNull();
  });

  it("should prefill plate in facade when initialPlate input is provided", () => {
    fixture.componentRef.setInput("initialPlate", "XYZ789");
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    expect(component.facade.plate()).toBe("XYZ-789");
  });


});
