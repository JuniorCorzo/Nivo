import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { SlotSummary } from "@core/models/slot.model";
import type { CreateTicketPayload, TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { CheckInModalComponent } from "../components/modals/check-in-modal/check-in-modal";
import { TicketDeliveryCardComponent } from "../components/receipt/ticket-delivery-card/ticket-delivery-card";
import { TicketReceiptComponent } from "../components/receipt/ticket-receipt/ticket-receipt";
import { CheckInFacade } from "../facades/check-in.facade";

@Component({
  imports: [CheckInModalComponent, TicketReceiptComponent],
  standalone: true,
  template: `
    <app-check-in-modal
      [isOpen]="isModalOpen()"
      [parkingId]="'p-integration-1'"
      [initialPlate]="initialPlate()"
      [initialUnplated]="initialUnplated()"
      [initialPhotoUrl]="initialPhotoUrl()"
      [preselectedSlot]="preselectedSlot()"
      (closed)="isModalOpen.set(false)"
    />
    <app-ticket-receipt
      [isOpen]="isReceiptOpen()"
      [ticket]="currentTicket()"
      (closed)="isReceiptOpen.set(false)"
    />
  `,
})
class TestOperationsIntegrationHostComponent {
  readonly isModalOpen = signal<boolean>(false);
  readonly initialPlate = signal<string>("");
  readonly initialUnplated = signal<boolean>(false);
  readonly initialPhotoUrl = signal<string | null>(null);
  readonly preselectedSlot = signal<SlotSummary | null>(null);
  readonly isReceiptOpen = signal<boolean>(false);
  readonly currentTicket = signal<TicketSummary | null>(null);
}

describe("Operations Cockpit & Multichannel Delivery Integration", () => {
  let fixture: ComponentFixture<TestOperationsIntegrationHostComponent>;
  let host: TestOperationsIntegrationHostComponent;

  let createdPayloads: CreateTicketPayload[] = [];
  const mockTicketService = {
    createTicket: vi.fn((payload: CreateTicketPayload) => {
      createdPayloads.push(payload);
      const res: TicketSummary = {
        entryTime: "2026-11-12T10:00:00Z",
        id: "t-integ-1",
        licensePlate: payload.plate,
        phoneNumber: payload.phoneNumber,
        plateCountry: payload.plateCountry,
        status: "OPEN",
      };
      return of(res);
    }),
  };

  const mockSlot: SlotSummary = {
    hasCharger: false,
    id: "slot-int-1",
    isAccessible: false,
    isActive: true,
    parkingName: "Sede Centro",
    prefix: "A",
    slotNumber: "101",
    status: "AVAILABLE",
    type: "CAR",
    zone: "Norte",
  };

  const mockRate = {
    createdAt: "",
    description: "Tarifa estándar",
    id: "rate-int-1",
    minChargeTimeMinutes: 0,
    name: "Tarifa Plena",
    parkingId: "p-integration-1",
    pricePerUnit: 5000,
    timeUnit: "HOURS",
    updatedAt: "",
    vehicleType: "CAR" as const,
  };

  beforeEach(async () => {
    createdPayloads = [];
    mockTicketService.createTicket.mockClear();

    await TestBed.configureTestingModule({
      imports: [TestOperationsIntegrationHostComponent],
      providers: [
        { provide: TicketService, useValue: mockTicketService },
        {
          provide: SlotService,
          useValue: {
            getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([mockSlot])),
            summaries: () => ({ "p-integration-1": [mockSlot] }),
          },
        },
        {
          provide: RateService,
          useValue: {
            getRatesByParkingId: vi.fn().mockReturnValue(of([mockRate])),
            ratesByParking: () => ({ "p-integration-1": [mockRate] }),
          },
        },
        {
          provide: ParkingService,
          useValue: {
            getAll: vi.fn(),
            parkingLots: () => [],
          },
        },
        {
          provide: ToastService,
          useValue: { showToast: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOperationsIntegrationHostComponent);
    host = fixture.componentInstance;
  });

  it("should integrate Omnibar plate transfer, plate formatting and Colombian country detection", async () => {
    host.initialPlate.set("col999");
    host.isModalOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const checkInModalEl = fixture.nativeElement.querySelector("app-check-in-modal");
    expect(checkInModalEl).not.toBeNull();

    const plateDisplay = checkInModalEl.querySelector("#plate-display");
    expect(plateDisplay?.textContent).toContain("COL-999");
    expect(checkInModalEl.textContent).toContain("CO");
  });

  it("should integrate Omnibar plate transfer with Venezuelan plate detection", async () => {
    host.initialPlate.set("ab123cd");
    host.isModalOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const checkInModalEl = fixture.nativeElement.querySelector("app-check-in-modal");
    const plateDisplay = checkInModalEl.querySelector("#plate-display");
    expect(plateDisplay?.textContent).toContain("AB-123-CD");
    expect(checkInModalEl.textContent).toContain("VE");
  });

  it("should enforce digital delivery isolation between WhatsApp and Email channels", async () => {
    host.initialPlate.set("XYZ123");
    host.isModalOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const modalDebug = fixture.debugElement.children[0];
    const modalComponent = modalDebug.componentInstance as CheckInModalComponent;
    const facade = modalComponent.facade;

    // 1. Initial state is PRINT: phone and email empty
    expect(facade.deliveryMethod()).toBe("PRINT");

    // 2. Switch to WHATSAPP and provide phone
    modalComponent.onDeliveryChannelChange("WHATSAPP");
    modalComponent.onPhoneChange("3112223344");
    fixture.detectChanges();

    expect(facade.isValid()).toBe(true);

    // 3. Switch to EMAIL and provide email
    modalComponent.onDeliveryChannelChange("EMAIL");
    modalComponent.onEmailChange("conductor@nivo.com");
    fixture.detectChanges();

    expect(facade.isValid()).toBe(true);

    // 4. Submit: Payload must contain ONLY email, phoneNumber must be undefined
    facade.submitCheckIn();

    expect(mockTicketService.createTicket).toHaveBeenCalledTimes(1);
    const sentPayload = createdPayloads[0];
    expect(sentPayload.email).toBe("conductor@nivo.com");
    expect(sentPayload.phoneNumber).toBeUndefined();
    expect(sentPayload.plate).toBe("XYZ-123");
  });

  it("should allow unplated vehicle check-in when initialPhotoUrl is supplied", async () => {
    host.initialUnplated.set(true);
    host.initialPhotoUrl.set("https://storage.nivo.dev/evidence/bike-123.jpg");
    host.preselectedSlot.set(mockSlot);
    host.isModalOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const modalDebug = fixture.debugElement.children[0];
    const modalComponent = modalDebug.componentInstance as CheckInModalComponent;
    const facade = modalComponent.facade;

    expect(facade.isUnplated()).toBe(true);
    expect(facade.photoUrl()).toBe("https://storage.nivo.dev/evidence/bike-123.jpg");
    expect(facade.isValid()).toBe(true);

    facade.submitCheckIn();
    expect(mockTicketService.createTicket).toHaveBeenCalledTimes(1);
    expect(createdPayloads[0].plateCountry).toBe("UNPLATED");
    expect(createdPayloads[0].photoUrl).toBe("https://storage.nivo.dev/evidence/bike-123.jpg");
  });
});
