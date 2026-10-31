import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { RateModel } from "@core/models/rate.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import {
  ButtonComponent,
  DividerComponent,
  ToastService,
} from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { of, throwError } from "rxjs";

import { OperationsPageComponent } from "./operations-page";

interface MockParkingService {
  getAll: ReturnType<typeof vi.fn>;
  parkingLots: () => ParkingLotListItemModel[];
}

interface MockSlotService {
  getAllSlotSummariesByParkingId: ReturnType<typeof vi.fn>;
  summaries: () => Record<string, unknown[]>;
}

interface MockRateService {
  getRatesByParkingId: ReturnType<typeof vi.fn>;
  ratesByParking: () => Record<string, RateModel[]>;
}

interface MockTicketService {
  createTicket: ReturnType<typeof vi.fn>;
  getActiveTicketBySlot: ReturnType<typeof vi.fn>;
  calculatePrice: ReturnType<typeof vi.fn>;
  checkOutVehicle: ReturnType<typeof vi.fn>;
  listTicketsByParkingLot: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("OperationsPageComponent", () => {
  let component: OperationsPageComponent;
  let fixture: ComponentFixture<OperationsPageComponent>;
  let parkingServiceSpy: MockParkingService;
  let slotServiceSpy: MockSlotService;
  let rateServiceSpy: MockRateService;
  let ticketServiceSpy: MockTicketService;
  let toastSpy: MockToastService;

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
    parkingServiceSpy = {
      getAll: vi.fn(),
      parkingLots: () => [mockLot],
    };

    slotServiceSpy = {
      getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of([])),
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
          {
            id: "s-3",
            parkingName: "Central",
            prefix: "B",
            slotNumber: "201",
            status: "AVAILABLE",
            type: "MOTORCYCLE",
            zone: "Z2",
          },
          {
            id: "s-4",
            parkingName: "Central",
            prefix: "B",
            slotNumber: "202",
            status: "OCCUPIED",
            type: "MOTORCYCLE",
            zone: "Z2",
          },
        ],
      }),
    };

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
    rateServiceSpy = {
      getRatesByParkingId: vi.fn().mockReturnValue(of([])),
      ratesByParking: () => ({
        "p-1": [mockRate],
      }),
    };

    ticketServiceSpy = {
      calculatePrice: vi.fn(),
      checkOutVehicle: vi.fn(),
      createTicket: vi.fn().mockReturnValue(of({ id: "t-mock" })),
      getActiveTicketBySlot: vi.fn(),
      listTicketsByParkingLot: vi.fn().mockReturnValue(of([])),
    };
    toastSpy = { showToast: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OperationsPageComponent],
      providers: [
        provideRouter([]),
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
    expect(component.totalSlotsCount()).toBe(4);
    expect(component.availableSlotsCount()).toBe(2);
    expect(component.availableCarSlotsCount()).toBe(1);
    expect(component.totalCarSlotsCount()).toBe(2);
    expect(component.availableMotoSlotsCount()).toBe(1);
    expect(component.totalMotoSlotsCount()).toBe(2);
    expect(component.occupiedSlotsCount()).toBe(2);
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

  it("should render page header with quick action buttons that trigger modal methods", () => {
    fixture.detectChanges();
    const pageHeader = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    expect(pageHeader).toBeTruthy();

    const buttons = fixture.debugElement.queryAll(
      By.directive(ButtonComponent)
    );
    const checkInBtn = buttons.find((btn) =>
      btn.nativeElement.textContent.includes("Registrar Ingreso")
    );
    const checkOutBtn = buttons.find((btn) =>
      btn.nativeElement.textContent.includes("Procesar Salida")
    );

    expect(checkInBtn).toBeDefined();
    expect(checkOutBtn).toBeDefined();

    checkInBtn?.nativeElement.click();
    expect(component.isCheckInModalOpen()).toBe(true);
    component.closeCheckInModal();

    checkOutBtn?.nativeElement.click();
    expect(component.isCheckOutModalOpen()).toBe(true);
  });

  it("should render tickets navigation link and divider in quick action buttons", () => {
    fixture.detectChanges();
    const divider = fixture.debugElement.query(By.directive(DividerComponent));
    expect(divider).toBeTruthy();

    const ticketLink = fixture.debugElement.query(By.css("a[nv-button]"));
    expect(ticketLink).toBeTruthy();
    expect(ticketLink.nativeElement.textContent).toContain("Ver Tickets");
  });

  it("should render 4 operational booth cards in summary grid", () => {
    fixture.detectChanges();
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Cupos Carros");
    expect(compiled.textContent).toContain("Cupos Motos");
    expect(compiled.textContent).toContain("Vehículos Dentro");
    expect(compiled.textContent).toContain("Nivel Ocupación");
    expect(compiled.textContent).not.toContain("Tarifas Activas");
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
      hasCharger: false,
      id: "s-2",
      isAccessible: false,
      isActive: true,
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

    ticketServiceSpy.getActiveTicketBySlot.mockReturnValue(of(mockTicket));

    component.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith("s-2");
    expect(component.selectedCheckoutTicket()).toEqual(mockTicket);
    expect(component.isCheckOutModalOpen()).toBe(true);
  });

  it("should show error toast when active ticket lookup fails on checkOutSpecificSlot", () => {
    const mockSlot = {
      hasCharger: false,
      id: "s-2",
      isAccessible: false,
      isActive: true,
      parkingName: "Central",
      prefix: "A",
      slotNumber: "102",
      status: "OCCUPIED" as const,
      type: "CAR" as const,
      zone: "Z1",
    };

    ticketServiceSpy.getActiveTicketBySlot.mockReturnValue(
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
      hasCharger: false,
      id: "s-2",
      isAccessible: false,
      isActive: true,
      parkingName: "Central",
      prefix: "A",
      slotNumber: "102",
      status: "OCCUPIED" as const,
      type: "CAR" as const,
      zone: "Z1",
    };

    ticketServiceSpy.getActiveTicketBySlot.mockReturnValue(
      throwError(() => new Error("Unknown"))
    );

    component.checkOutSpecificSlot(mockSlot);

    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "No se encontró un ticket activo para este cupo.",
      type: "error",
    });
  });

  describe("Active Tickets Table & Operations", () => {
    const mockActiveTickets = [
      {
        entryTime: "2026-10-16T10:00:00Z",
        id: "t-1",
        licensePlate: "ABC-123",
        plateCountry: "CO" as const,
        slotNumber: "101",
        status: "OPEN" as const,
      },
      {
        entryTime: "2026-10-16T10:30:00Z",
        id: "t-2",
        licensePlate: "VE-789-XY",
        plateCountry: "VE" as const,
        slotNumber: "102",
        status: "OPEN" as const,
      },
      {
        entryTime: "2026-10-16T09:00:00Z",
        id: "t-3",
        licensePlate: "OLD-000",
        slotNumber: "103",
        status: "CLOSED" as const,
      },
    ];

    it("should load active tickets on init and filter only OPEN status", () => {
      ticketServiceSpy.listTicketsByParkingLot.mockReturnValue(
        of(mockActiveTickets)
      );

      component.refreshActiveTickets();

      expect(ticketServiceSpy.listTicketsByParkingLot).toHaveBeenCalledWith(
        "p-1"
      );
      expect(component.activeTickets().length).toBe(2);
      expect(component.activeTickets().map((t) => t.id)).toEqual([
        "t-1",
        "t-2",
      ]);
    });

    it("should filter active tickets by search query against plate and slot number", () => {
      component.activeTickets.set([mockActiveTickets[0], mockActiveTickets[1]]);

      // No query
      component.setSearchTicketQuery("");
      expect(component.filteredActiveTickets().length).toBe(2);

      // Search by plate
      component.setSearchTicketQuery("abc");
      expect(component.filteredActiveTickets().length).toBe(1);
      expect(component.filteredActiveTickets()[0].id).toBe("t-1");

      // Search by slot
      component.setSearchTicketQuery("102");
      expect(component.filteredActiveTickets().length).toBe(1);
      expect(component.filteredActiveTickets()[0].id).toBe("t-2");

      // No match
      component.setSearchTicketQuery("nonexistent");
      expect(component.filteredActiveTickets().length).toBe(0);
    });

    it("should update search ticket query via onSearchQueryChange", () => {
      const input = document.createElement("input");
      input.value = "ABC";
      const event = new Event("input");
      Object.defineProperty(event, "target", { value: input, writable: false });

      component.onSearchQueryChange(event);
      expect(component.searchTicketQuery()).toBe("ABC");
    });

    it("should open checkout modal with preselected ticket when checkOutWithTicket is called", () => {
      const [ticket] = mockActiveTickets;
      component.checkOutWithTicket(ticket);

      expect(component.selectedCheckoutTicket()).toEqual(ticket);
      expect(component.isCheckOutModalOpen()).toBe(true);
    });

    it("should refresh active tickets and slots when check-in or check-out modal closes", () => {
      const refreshSpy = vi.spyOn(component, "refreshActiveTickets");

      component.closeCheckInModal();
      expect(refreshSpy).toHaveBeenCalledTimes(1);

      component.closeCheckOutModal();
      expect(refreshSpy).toHaveBeenCalledTimes(2);
    });

    it("should render active tickets and handle Cobrar action in template", () => {
      component.activeTickets.set([mockActiveTickets[0]]);
      fixture.detectChanges();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain("Vehículos Activos en Taquilla");
      expect(compiled.textContent).toContain("ABC-123");
      expect(compiled.textContent).toContain("Bahía 101");

      const table = fixture.debugElement.query(By.css("table"));
      const cobrarButton = table?.query(By.directive(ButtonComponent));
      expect(cobrarButton).toBeDefined();

      cobrarButton?.nativeElement.click();
      expect(component.selectedCheckoutTicket()).toEqual(mockActiveTickets[0]);
      expect(component.isCheckOutModalOpen()).toBe(true);
    });

    it("should render empty state when no active tickets exist", () => {
      component.activeTickets.set([]);
      fixture.detectChanges();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain(
        "No hay vehículos activos en este momento."
      );
    });

    it("should trigger hotkeys I, O, and Q to open modals when target is not an input", () => {
      const checkInSpy = vi.spyOn(component, "openCheckInModal");
      const checkOutSpy = vi.spyOn(component, "openDirectCheckOutModal");
      const qrSpy = vi.spyOn(component, "openQrScanner");

      // Press I
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));
      expect(checkInSpy).toHaveBeenCalledTimes(1);

      // Press O
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "o" }));
      expect(checkOutSpy).toHaveBeenCalledTimes(1);

      // Press Q
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      expect(qrSpy).toHaveBeenCalledTimes(1);
    });

    it("should ignore hotkeys when typing in input or textarea", () => {
      const checkInSpy = vi.spyOn(component, "openCheckInModal");
      const qrSpy = vi.spyOn(component, "openQrScanner");

      const input = document.createElement("input");
      document.body.append(input);

      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "q",
      });
      Object.defineProperty(event, "target", { value: input, writable: false });

      component.handleKeyboardShortcuts(event);
      expect(checkInSpy).not.toHaveBeenCalled();
      expect(qrSpy).not.toHaveBeenCalled();

      input.remove();
    });

    it("should render Dock Express Superior with aforo meter and express check-in bar", () => {
      fixture.detectChanges();
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain("Aforo General");
      expect(compiled.textContent).toContain("libres de 4 totales");
      expect(compiled.textContent).toContain("+ Ingresar");
      expect(compiled.textContent).toContain("Escanear QR");
    });

    it("should toggle QR scanner modal open and close", () => {
      expect(component.isQrScannerOpen()).toBe(false);
      component.openQrScanner();
      expect(component.isQrScannerOpen()).toBe(true);
      component.closeQrScanner();
      expect(component.isQrScannerOpen()).toBe(false);
    });

    it("should submit express check-in successfully for car", () => {
      const mockCreatedTicket = {
        entryTime: "2026-10-27T10:00:00",
        id: "t-new",
        licensePlate: "EXP123",
        parkingLotId: "p-1",
        rateId: "r-1",
        slotId: "s-1",
        slotNumber: "101",
        status: "OPEN" as const,
      };
      ticketServiceSpy.createTicket.mockReturnValue(of(mockCreatedTicket));
      const refreshSpy = vi.spyOn(component, "refreshActiveTickets");

      component.expressPlate.set("EXP-123");
      component.setExpressVehicleType("CAR");
      component.submitExpressCheckIn();

      expect(ticketServiceSpy.createTicket).toHaveBeenCalledWith({
        plate: "EXP123",
        rateId: "r-1",
        slotId: "s-1",
      });
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
        })
      );
      expect(component.expressPlate()).toBe("");
      expect(refreshSpy).toHaveBeenCalled();
    });

    it("should handle onQrScanned and open checkout modal when active ticket matches by plate", () => {
      component.activeTickets.set(mockActiveTickets);
      const checkoutSpy = vi
        .spyOn(component, "checkOutWithTicket")
        .mockImplementation(() => {});

      component.onQrScanned({ plate: "ABC123" });

      expect(checkoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({ licensePlate: "ABC-123" })
      );
      expect(component.isQrScannerOpen()).toBe(false);
    });

    it("should handle onQrScanned and open checkout modal when active ticket matches by ticketId (unplated vehicle)", () => {
      component.activeTickets.set(mockActiveTickets);
      const checkoutSpy = vi
        .spyOn(component, "checkOutWithTicket")
        .mockImplementation(() => {});

      component.onQrScanned({ ticketId: "t-1" });

      expect(checkoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: "t-1" })
      );
      expect(component.isQrScannerOpen()).toBe(false);
    });

    it("should show error toast and never create check-in when scanned ticket is not found in active tickets", () => {
      component.onQrScanned({ ticketId: "nonexistent-ticket-id" });

      expect(toastSpy.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            "no encontrado en taquilla o ya fue liquidado"
          ),
          type: "error",
        })
      );
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();
      expect(component.isCheckOutModalOpen()).toBe(false);
    });

    it("should show error toast if plate is empty on express check-in", () => {
      component.expressPlate.set("   ");
      component.submitExpressCheckIn();

      expect(toastSpy.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            "Por favor ingresa una placa válida"
          ),
          type: "error",
        })
      );
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();
    });

    it("should show error toast if no slots are available for requested vehicle type", () => {
      // Set vehicle type to one without rate or slot
      component.expressPlate.set("ABC123");
      component.submitExpressCheckIn("ABC123", "BIKE");

      expect(toastSpy.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
        })
      );
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();
    });
  });

  describe("Clean Tap Cards & Salida Express", () => {
    it("should trigger check-in with preselected slot when onSlotClick is called on an available slot", () => {
      const [availableSlot] = component.slots();
      expect(availableSlot.status).toBe("AVAILABLE");

      component.onSlotClick(availableSlot);

      expect(component.selectedCheckInSlot()).toEqual(availableSlot);
      expect(component.isCheckInModalOpen()).toBe(true);

      // Closing modal clears preselected slot
      component.closeCheckInModal();
      expect(component.selectedCheckInSlot()).toBeNull();
      expect(component.isCheckInModalOpen()).toBe(false);
    });

    it("should trigger check-out when onSlotClick is called on an occupied slot", () => {
      const [, occupiedSlot] = component.slots();
      expect(occupiedSlot.status).toBe("OCCUPIED");

      const checkOutSpy = vi
        .spyOn(component, "checkOutSpecificSlot")
        .mockImplementation(() => {});
      component.onSlotClick(occupiedSlot);

      expect(checkOutSpy).toHaveBeenCalledWith(occupiedSlot);
    });

    it("should do nothing when onSlotClick is called on a slot that is neither available nor occupied", () => {
      const maintenanceSlot = {
        ...component.slots()[0],
        status: "MAINTENANCE" as const,
      };
      const checkInSpy = vi.spyOn(component, "checkInSpecificSlot");
      const checkOutSpy = vi.spyOn(component, "checkOutSpecificSlot");

      component.onSlotClick(maintenanceSlot);

      expect(checkInSpy).not.toHaveBeenCalled();
      expect(checkOutSpy).not.toHaveBeenCalled();
    });

    it("should find active ticket for slot by slotId or slotNumber in getActiveTicketForSlot", () => {
      const mockTicket = {
        entryTime: "2026-10-16T10:00:00Z",
        id: "t-1",
        licensePlate: "ABC-123",
        slotId: "s-2",
        slotNumber: "102",
        status: "OPEN" as const,
      };
      component.activeTickets.set([mockTicket]);

      const matchingSlot = component.slots().find((s) => s.id === "s-2");
      expect(matchingSlot).toBeDefined();
      if (matchingSlot) {
        expect(component.getActiveTicketForSlot(matchingSlot)).toEqual(
          mockTicket
        );
      }

      const nonMatchingSlot = component.slots().find((s) => s.id === "s-1");
      expect(nonMatchingSlot).toBeDefined();
      if (nonMatchingSlot) {
        expect(
          component.getActiveTicketForSlot(nonMatchingSlot)
        ).toBeUndefined();
      }
    });

    it("should render clean tap cards with accessible attributes and footer badges", () => {
      component.activeTickets.set([
        {
          entryTime: "2026-10-16T10:00:00Z",
          id: "t-1",
          licensePlate: "ABC-123",
          slotId: "s-2",
          slotNumber: "102",
          status: "OPEN" as const,
        },
      ]);
      fixture.detectChanges();

      const cards: HTMLElement[] =
        fixture.nativeElement.querySelectorAll("div[role='button']");
      expect(cards.length).toBeGreaterThanOrEqual(4);

      // Verify available card footer
      expect(fixture.nativeElement.textContent).toContain("+ Asignar bahía");
      // Verify occupied card footer
      expect(fixture.nativeElement.textContent).toContain("⏱ Cobrar Salida");
      // Verify plate is shown inside occupied card
      expect(fixture.nativeElement.textContent).toContain("ABC-123");
      // Verify Cobrar Salida Directa button exists
      expect(fixture.nativeElement.textContent).toContain(
        "Cobrar Salida Directa"
      );
    });

    describe("submitExpressCheckOutByQuery", () => {
      const mockTickets = [
        {
          entryTime: "2026-10-16T10:00:00Z",
          id: "t-1",
          licensePlate: "ABC-123",
          slotNumber: "101",
          status: "OPEN" as const,
        },
        {
          entryTime: "2026-10-16T10:30:00Z",
          id: "t-2",
          licensePlate: "XYZ-999",
          slotNumber: "102",
          status: "OPEN" as const,
        },
      ];

      beforeEach(() => {
        component.activeTickets.set(mockTickets);
      });

      it("should show error toast if query is empty", () => {
        component.setSearchTicketQuery("");
        component.submitExpressCheckOutByQuery();

        expect(toastSpy.showToast).toHaveBeenCalledWith({
          message: "Ingresa una placa o bahía para cobrar salida.",
          type: "error",
        });
        expect(component.isCheckOutModalOpen()).toBe(false);
      });

      it("should open checkout modal directly when query has a single unique match", () => {
        component.setSearchTicketQuery("XYZ");
        component.submitExpressCheckOutByQuery();

        expect(component.selectedCheckoutTicket()).toEqual(mockTickets[1]);
        expect(component.isCheckOutModalOpen()).toBe(true);
      });

      it("should open checkout modal when query has an exact match even among multiple matches", () => {
        component.setSearchTicketQuery("101");
        component.submitExpressCheckOutByQuery();

        expect(component.selectedCheckoutTicket()).toEqual(mockTickets[0]);
        expect(component.isCheckOutModalOpen()).toBe(true);
      });

      it("should show warning toast when multiple matches are found without exact match", () => {
        component.activeTickets.set([
          { ...mockTickets[0], licensePlate: "ABC-100" },
          { ...mockTickets[1], licensePlate: "ABC-200" },
        ]);
        component.setSearchTicketQuery("ABC");
        component.submitExpressCheckOutByQuery();

        expect(toastSpy.showToast).toHaveBeenCalledWith({
          message: "Múltiples vehículos coinciden. Selecciona uno de la lista.",
          type: "warning",
        });
        expect(component.isCheckOutModalOpen()).toBe(false);
      });

      it("should show error toast when no active vehicles match the query", () => {
        component.setSearchTicketQuery("NONEXISTENT");
        component.submitExpressCheckOutByQuery();

        expect(toastSpy.showToast).toHaveBeenCalledWith({
          message: "No se encontró ningún vehículo activo con ese criterio.",
          type: "error",
        });
        expect(component.isCheckOutModalOpen()).toBe(false);
      });
    });
  });
});
