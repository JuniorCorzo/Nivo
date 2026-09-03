import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { RateModel } from "@core/models/rate.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import { OperationsPageComponent } from "./operations-page";

describe("OperationsPageComponent", () => {
  let component: OperationsPageComponent;
  let fixture: ComponentFixture<OperationsPageComponent>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let slotServiceSpy: jasmine.SpyObj<SlotService>;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const mockLot: ParkingLotListItemModel = {
      address: {
        city: "Bogota",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 1",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6, longitude: -74 },
      createdAt: "",
      currency: "COP",
      id: "p-1",
      name: "Parqueadero Central",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 100,
      updatedAt: "",
    };
    parkingServiceSpy = jasmine.createSpyObj("ParkingService", ["getAll"], {
      parkingLots: () => [mockLot],
    });

    slotServiceSpy = jasmine.createSpyObj(
      "SlotService",
      ["getAllSlotSummariesByParkingId"],
      {
        summaries: () => ({
          "p-1": [
            {
              id: "s-1",
              parkingName: "Central",
              prefix: "A",
              slotNumber: "101",
              status: "AVAILABLE",
              type: "CAR",
              zone: "Z1",
            },
            {
              id: "s-2",
              parkingName: "Central",
              prefix: "A",
              slotNumber: "102",
              status: "OCCUPIED",
              type: "CAR",
              zone: "Z1",
            },
          ],
        }),
      }
    );

    const mockRate: RateModel = {
      createdAt: "",
      description: "",
      id: "r-1",
      minChargeTimeMinutes: 15,
      name: "Tarifa Carro",
      parkingId: "p-1",
      pricePerUnit: 5000,
      timeUnit: "HOURS",
      updatedAt: "",
      vehicleType: "CAR",
    };
    rateServiceSpy = jasmine.createSpyObj(
      "RateService",
      ["getRatesByParkingId"],
      {
        ratesByParking: () => ({
          "p-1": [mockRate],
        }),
      }
    );

    ticketServiceSpy = jasmine.createSpyObj("TicketService", [
      "createTicket",
      "getActiveTicketBySlot",
      "calculatePrice",
      "checkOutVehicle",
    ]);
    toastSpy = jasmine.createSpyObj("ToastService", ["showToast"]);

    slotServiceSpy.getAllSlotSummariesByParkingId.and.returnValue(of([]));
    rateServiceSpy.getRatesByParkingId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [OperationsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ parkingId: "p-1" })),
          },
        },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: SlotService, useValue: slotServiceSpy },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsPageComponent);
    component = fixture.componentInstance;
  });

  it("should create OperationsPageComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should compute metrics accurately for slots and occupation", () => {
    expect(component.totalSlotsCount()).toBe(2);
    expect(component.availableSlotsCount()).toBe(1);
    expect(component.occupiedSlotsCount()).toBe(1);
    expect(component.occupationPercentage()).toBe(50);
  });

  it("should toggle check-in modal state", () => {
    expect(component.isCheckInModalOpen()).toBe(false);
    component.openCheckInModal();
    expect(component.isCheckInModalOpen()).toBe(true);
    component.closeCheckInModal();
    expect(component.isCheckInModalOpen()).toBe(false);
  });

  it("should toggle check-out modal state", () => {
    expect(component.isCheckOutModalOpen()).toBe(false);
    component.openDirectCheckOutModal();
    expect(component.isCheckOutModalOpen()).toBe(true);
    component.closeCheckOutModal();
    expect(component.isCheckOutModalOpen()).toBe(false);
  });

  it("should filter slots by vehicle type and status", () => {
    component.setVehicleFilter("CAR");
    expect(component.filteredSlots().length).toBe(2);

    component.setStatusFilter("AVAILABLE");
    expect(component.filteredSlots().length).toBe(1);
    expect(component.filteredSlots()[0].id).toBe("s-1");
  });

  it("should fetch active ticket for occupied slot and open checkout modal on checkOutSpecificSlot", () => {
    const mockSlot = {
      id: "s-2",
      parkingName: "Central",
      prefix: "A",
      slotNumber: "102",
      status: "OCCUPIED" as const,
      type: "CAR" as const,
      zone: "Z1",
    };
    const mockTicket = {
      entryTime: "2026-08-28T12:00:00Z",
      id: "ticket-999",
      licensePlate: "ABC123",
      slotId: "s-2",
      slotNumber: "102",
      status: "OPEN" as const,
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(of(mockTicket));

    component.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith("s-2");
    expect(component.selectedCheckoutTicket()).toEqual(mockTicket);
    expect(component.isCheckOutModalOpen()).toBe(true);
  });

  it("should show error toast when active ticket lookup fails on checkOutSpecificSlot", () => {
    const mockSlot = {
      id: "s-2",
      parkingName: "Central",
      prefix: "A",
      slotNumber: "102",
      status: "OCCUPIED" as const,
      type: "CAR" as const,
      zone: "Z1",
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(
      throwError(() => ({ error: { message: "Ticket no encontrado" } }))
    );

    component.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith("s-2");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Ticket no encontrado",
      type: "error",
    });
    expect(component.isCheckOutModalOpen()).toBe(false);
  });

  it("should fallback to default error message if error payload has no message", () => {
    const mockSlot = {
      id: "s-2",
      parkingName: "Central",
      prefix: "A",
      slotNumber: "102",
      status: "OCCUPIED" as const,
      type: "CAR" as const,
      zone: "Z1",
    };

    ticketServiceSpy.getActiveTicketBySlot.and.returnValue(
      throwError(() => new Error("Unknown"))
    );

    component.checkOutSpecificSlot(mockSlot);

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "No se encontró un ticket activo para este cupo.",
      type: "error",
    });
  });
});
