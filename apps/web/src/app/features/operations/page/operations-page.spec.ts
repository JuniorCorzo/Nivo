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
import type { TicketSummary } from "@core/models/ticket.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { SlotService } from "@core/services/slot-service";
import { TicketService } from "@core/services/ticket-service";
import { ButtonComponent, ToastService } from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";

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
            queryParamMap: of(convertToParamMap({})),
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
    expect(component.facade.totalSlotsCount()).toBe(4);
    expect(component.facade.availableSlotsCount()).toBe(2);
    expect(component.facade.availableCarSlotsCount()).toBe(1);
    expect(component.facade.totalCarSlotsCount()).toBe(2);
    expect(component.facade.availableMotoSlotsCount()).toBe(1);
    expect(component.facade.totalMotoSlotsCount()).toBe(2);
    expect(component.facade.occupiedSlotsCount()).toBe(2);
    expect(component.facade.occupationPercentage()).toBe(50);
    expect(component.facade.occupationBarPercentage()).toBe(50);
  });

  it("should clamp occupationBarPercentage to 100 when occupied slots exceed total slots", () => {
    vi.spyOn(component.facade, "occupationPercentage").mockReturnValue(125);
    expect(component.facade.occupationBarPercentage()).toBe(100);
  });

  it("should toggle check-in modal state", () => {
    expect(component.facade.isCheckInModalOpen()).toBe(false);
    component.facade.openCheckInModal();
    expect(component.facade.isCheckInModalOpen()).toBe(true);
    component.facade.closeCheckInModal();
    expect(component.facade.isCheckInModalOpen()).toBe(false);
  });

  it("should toggle check-out modal state", () => {
    expect(component.facade.isCheckOutModalOpen()).toBe(false);
    component.facade.openDirectCheckOutModal();
    expect(component.facade.isCheckOutModalOpen()).toBe(true);
    component.facade.closeCheckOutModal();
    expect(component.facade.isCheckOutModalOpen()).toBe(false);
  });

  it("should render page header with projected subtitle and parking-lot tickets route even while parking metadata is loading", () => {
    fixture.detectChanges();
    const pageHeader = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    expect(pageHeader).toBeTruthy();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in page header */
    const pageHeaderEl = pageHeader.nativeElement as HTMLElement;
    const actionsEl = pageHeaderEl.querySelector(
      '[data-testid="page-header-actions"]'
    );
    const ticketsLink = actionsEl?.querySelector("a");
    expect(ticketsLink?.textContent).toContain("Ver Tickets");
    expect(ticketsLink?.getAttribute("href")).toBe(
      "/app/parking-lots/p-1/tickets"
    );
    expect(pageHeaderEl.textContent).toContain("Parqueadero Central");
    expect(pageHeaderEl.textContent).toContain(
      "Control vehicular y gestión de taquilla en tiempo real"
    );
    expect(pageHeaderEl.textContent).not.toContain("Registrar Ingreso");
    expect(pageHeaderEl.textContent).not.toContain("Procesar Salida");

    // Verify fallback when parking() is still loading (empty parkingLots)
    parkingServiceSpy.parkingLots = () => [];
    fixture = TestBed.createComponent(OperationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const loadingHeaderEl = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    ).nativeElement as HTMLElement;
    const loadingTicketsLink = loadingHeaderEl.querySelector(
      '[data-testid="page-header-actions"] a'
    );
    expect(loadingTicketsLink?.getAttribute("href")).toBe(
      "/app/parking-lots/p-1/tickets"
    );
    expect(loadingHeaderEl.textContent).toContain(
      "Control vehicular y gestión de taquilla en tiempo real"
    );
  });

  it("should render Unified KPI Ribbon with global capacity, cars, motos, and active counts accurately", () => {
    fixture.detectChanges();
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const text = (fixture.nativeElement as HTMLElement).textContent?.replaceAll(
      /\s+/gu,
      " "
    );
    expect(text).toContain("Capacidad Global 50%");
    expect(text).toContain("2 libres de 4");
    expect(text).toContain("Carros 1 libres / 2");
    expect(text).toContain("Motos 1 libres / 2");
    expect(text).toContain("Activos 2 activos");
  });

  it("should hide vehicle type KPI card in ribbon when there are no slots of that type", () => {
    slotServiceSpy.summaries = () => ({
      "p-1": [
        {
          id: "s-1",
          parkingName: "Central",
          prefix: "A",
          slotNumber: "01",
          status: "AVAILABLE",
          type: "CAR",
          zone: "Z1",
        },
      ],
    });

    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const ribbonText = (
      fixture.nativeElement.querySelector(
        '[data-testid="operations-kpi-ribbon"]'
      ) as HTMLElement | null
    )?.textContent?.replaceAll(/\s+/gu, " ");

    expect(ribbonText).toContain("Carros 1 libres / 1");
    expect(ribbonText).not.toContain("Motos");
  });

  it("should filter slots by vehicle type and status", () => {
    component.facade.setVehicleFilter("CAR");
    expect(component.facade.filteredSlots().length).toBe(2);

    component.facade.setStatusFilter("AVAILABLE");
    expect(component.facade.filteredSlots().length).toBe(1);
    expect(component.facade.filteredSlots()[0].id).toBe("s-1");
  });

  it("should reset slot filters when resetSlotFilters is called", () => {
    component.facade.setVehicleFilter("CAR");
    component.facade.setStatusFilter("AVAILABLE");
    expect(component.facade.filteredSlots().length).toBe(1);

    component.facade.resetSlotFilters();

    expect(component.facade.vehicleFilter()).toBe("ALL");
    expect(component.facade.statusFilter()).toBe("ALL");
    expect(component.facade.filteredSlots().length).toBe(4);
  });

  it("should render empty state with reset button when no slots match filters and reset filters on click", () => {
    component.facade.setVehicleFilter("TRUCK");
    fixture.detectChanges();

    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain(
      "No se encontraron bahías con los filtros seleccionados."
    );
    expect(compiled.textContent).toContain(
      "Prueba cambiando el tipo de vehículo o el estado."
    );

    const resetBtn = [...compiled.querySelectorAll("button")].find((btn) =>
      btn.textContent?.includes("Restablecer filtros")
    );
    expect(resetBtn).toBeDefined();

    resetBtn?.click();
    fixture.detectChanges();

    expect(component.facade.vehicleFilter()).toBe("ALL");
    expect(component.facade.statusFilter()).toBe("ALL");
    expect(component.facade.filteredSlots().length).toBe(4);
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

    component.facade.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith("s-2");
    expect(component.facade.selectedCheckoutTicket()).toEqual(mockTicket);
    expect(component.facade.isCheckOutModalOpen()).toBe(true);
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

    component.facade.checkOutSpecificSlot(mockSlot);

    expect(ticketServiceSpy.getActiveTicketBySlot).toHaveBeenCalledWith("s-2");
    expect(toastSpy.showToast).toHaveBeenCalledWith({
      message: "Ticket no encontrado",
      type: "error",
    });
    expect(component.facade.isCheckOutModalOpen()).toBe(false);
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

    component.facade.checkOutSpecificSlot(mockSlot);

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

      component.facade.refreshActiveTickets();

      expect(ticketServiceSpy.listTicketsByParkingLot).toHaveBeenCalledWith(
        "p-1"
      );
      expect(component.facade.activeTickets().length).toBe(2);
      expect(component.facade.activeTickets().map((t) => t.id)).toEqual([
        "t-1",
        "t-2",
      ]);
    });

    it("should filter active tickets by search query against plate and slot number", () => {
      component.facade.activeTickets.set([
        mockActiveTickets[0],
        mockActiveTickets[1],
      ]);

      // No query
      component.facade.setSearchTicketQuery("");
      expect(component.facade.filteredActiveTickets().length).toBe(2);

      // Search by plate
      component.facade.setSearchTicketQuery("abc");
      expect(component.facade.filteredActiveTickets().length).toBe(1);
      expect(component.facade.filteredActiveTickets()[0].id).toBe("t-1");

      // Search by slot
      component.facade.setSearchTicketQuery("102");
      expect(component.facade.filteredActiveTickets().length).toBe(1);
      expect(component.facade.filteredActiveTickets()[0].id).toBe("t-2");

      // No match
      component.facade.setSearchTicketQuery("nonexistent");
      expect(component.facade.filteredActiveTickets().length).toBe(0);
    });

    it("should display clear button in table search when query is not empty and clear it on click", () => {
      component.facade.setSearchTicketQuery("XYZ");
      fixture.detectChanges();

      const clearBtn = fixture.nativeElement.querySelector(
        '[aria-label="Limpiar búsqueda"]'
      );
      expect(clearBtn).toBeDefined();

      clearBtn?.click();
      fixture.detectChanges();

      expect(component.facade.searchTicketQuery()).toBe("");
      const clearBtnAfter = fixture.nativeElement.querySelector(
        '[aria-label="Limpiar búsqueda"]'
      );
      expect(clearBtnAfter).toBeNull();
    });

    it("should open checkout modal with preselected ticket when checkOutWithTicket is called", () => {
      const [ticket] = mockActiveTickets;
      component.facade.checkOutWithTicket(ticket);

      expect(component.facade.selectedCheckoutTicket()).toEqual(ticket);
      expect(component.facade.isCheckOutModalOpen()).toBe(true);
    });

    it("should refresh active tickets and slots when check-in or check-out modal closes", () => {
      const refreshSpy = vi.spyOn(component.facade, "refreshActiveTickets");

      component.facade.closeCheckInModal();
      expect(refreshSpy).toHaveBeenCalledTimes(1);

      component.facade.closeCheckOutModal();
      expect(refreshSpy).toHaveBeenCalledTimes(2);
    });

    it("should render active tickets and handle Cobrar action in template", () => {
      component.facade.activeTickets.set([mockActiveTickets[0]]);
      fixture.detectChanges();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain("Vehículos Activos en Taquilla");
      expect(compiled.textContent).toContain("ABC-123");
      expect(compiled.textContent).toContain("Bahía 101");

      const table = fixture.debugElement.query(By.css("table"));
      const cobrarButton = table?.query(By.directive(ButtonComponent));
      expect(cobrarButton).toBeDefined();

      cobrarButton?.nativeElement.click();
      expect(component.facade.selectedCheckoutTicket()).toEqual(
        mockActiveTickets[0]
      );
      expect(component.facade.isCheckOutModalOpen()).toBe(true);
    });

    it("should render empty state when no active tickets exist", () => {
      component.facade.activeTickets.set([]);
      fixture.detectChanges();

      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain(
        "No hay vehículos activos en este momento."
      );
    });

    it("should trigger hotkeys I, O, and Q to open modals when target is not an input", () => {
      const checkInSpy = vi
        .spyOn(component.facade, "openCheckInModal")
        .mockImplementation(() => {});
      const checkOutSpy = vi
        .spyOn(component.facade, "openDirectCheckOutModal")
        .mockImplementation(() => {});
      const qrSpy = vi
        .spyOn(component.facade, "openQrScanner")
        .mockImplementation(() => {});

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
      const checkInSpy = vi.spyOn(component.facade, "openCheckInModal");
      const qrSpy = vi.spyOn(component.facade, "openQrScanner");

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

    it("should not trigger I, O, or Q shortcuts when a modal is open (checkIn, checkOut, or qrScanner)", () => {
      const checkInSpy = vi.spyOn(component.facade, "openCheckInModal");
      const checkOutSpy = vi.spyOn(component.facade, "openDirectCheckOutModal");
      const qrSpy = vi.spyOn(component.facade, "openQrScanner");

      // Case 1: check-in modal open
      component.facade.isCheckInModalOpen.set(true);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "o" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      expect(checkInSpy).not.toHaveBeenCalled();
      expect(checkOutSpy).not.toHaveBeenCalled();
      expect(qrSpy).not.toHaveBeenCalled();
      component.facade.isCheckInModalOpen.set(false);

      // Case 2: check-out modal open
      component.facade.isCheckOutModalOpen.set(true);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "o" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      expect(checkInSpy).not.toHaveBeenCalled();
      expect(checkOutSpy).not.toHaveBeenCalled();
      expect(qrSpy).not.toHaveBeenCalled();
      component.facade.isCheckOutModalOpen.set(false);

      // Case 3: qr scanner open
      component.facade.isQrScannerOpen.set(true);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "o" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      expect(checkInSpy).not.toHaveBeenCalled();
      expect(checkOutSpy).not.toHaveBeenCalled();
      expect(qrSpy).not.toHaveBeenCalled();
    });

    it("should render Omnibar Táctico de Taquilla with express check-in and express check-out controls", () => {
      fixture.detectChanges();
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.textContent).toContain("Ingreso Exprés");
      expect(compiled.textContent).toContain("Ingresar");
      expect(compiled.textContent).toContain("Sin Placa");
      expect(compiled.textContent).toContain("Cobro & Salida Exprés");
      expect(compiled.textContent).toContain("Cobrar Salida");
      expect(compiled.textContent).toContain("Escanear QR");
    });

    it("should open check-in modal with checkInModalInitialUnplated true on clicking Sin Placa in Omnibar", () => {
      const checkInSpy = vi.spyOn(component.facade, "openCheckInModal");
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.directive(ButtonComponent)
      );
      const sinPlacaBtn = buttons.find((btn) =>
        btn.nativeElement.textContent.includes("Sin Placa")
      );
      expect(sinPlacaBtn).toBeDefined();

      sinPlacaBtn?.nativeElement.click();
      expect(checkInSpy).toHaveBeenCalledWith(true);
      expect(component.facade.isCheckInModalOpen()).toBe(true);
      expect(component.facade.checkInModalInitialUnplated()).toBe(true);
    });

    it("should trigger express check-out action when clicking Cobrar Salida button in Omnibar", () => {
      const checkOutSpy = vi.spyOn(
        component.facade,
        "submitExpressCheckOutByQuery"
      );
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.directive(ButtonComponent)
      );
      const cobrarSalidaBtn = buttons.find(
        (btn) =>
          btn.nativeElement.textContent.includes("Cobrar Salida") &&
          !btn.nativeElement.textContent.includes("Directa")
      );
      expect(cobrarSalidaBtn).toBeDefined();

      cobrarSalidaBtn?.nativeElement.click();
      expect(checkOutSpy).toHaveBeenCalled();
    });

    it("should trigger express check-in on clicking Ingresar in Omnibar", () => {
      const submitSpy = vi.spyOn(component.facade, "submitExpressCheckIn");
      component.facade.expressPlate.set("ABC123");
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.directive(ButtonComponent)
      );
      const ingresarBtn = buttons.find((btn) =>
        btn.nativeElement.textContent.includes("Ingresar")
      );
      expect(ingresarBtn).toBeDefined();

      ingresarBtn?.nativeElement.click();
      expect(submitSpy).toHaveBeenCalled();
    });

    it("should open QR scanner modal on clicking Escanear QR in Omnibar", () => {
      const qrSpy = vi.spyOn(component.facade, "openQrScanner");
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(
        By.directive(ButtonComponent)
      );
      const qrBtn = buttons.find((btn) =>
        btn.nativeElement.textContent.includes("Escanear QR")
      );
      expect(qrBtn).toBeDefined();

      qrBtn?.nativeElement.click();
      expect(qrSpy).toHaveBeenCalled();
    });

    it("should toggle QR scanner modal open and close", () => {
      expect(component.facade.isQrScannerOpen()).toBe(false);
      component.facade.openQrScanner();
      expect(component.facade.isQrScannerOpen()).toBe(true);
      component.facade.closeQrScanner();
      expect(component.facade.isQrScannerOpen()).toBe(false);
    });

    it("should open check-in modal with entered plate and assigned slot on submitExpressCheckIn", () => {
      component.facade.expressPlate.set("EXP-123");
      component.facade.setExpressVehicleType("CAR");
      component.facade.submitExpressCheckIn();

      expect(component.facade.isCheckInModalOpen()).toBe(true);
      expect(component.facade.checkInModalInitialPlate()).toBe("EXP123");
      expect(component.facade.selectedCheckInSlot()?.type).toBe("CAR");
    });

    it("should handle onQrScanned and open checkout modal when active ticket matches by plate", () => {
      component.facade.activeTickets.set(mockActiveTickets);
      const checkoutSpy = vi
        .spyOn(component.facade, "checkOutWithTicket")
        .mockImplementation(() => {});

      component.facade.onQrScanned({ plate: "ABC123" });

      expect(checkoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({ licensePlate: "ABC-123" })
      );
      expect(component.facade.isQrScannerOpen()).toBe(false);
    });

    it("should handle onQrScanned and open checkout modal when active ticket matches by ticketId (unplated vehicle)", () => {
      component.facade.activeTickets.set(mockActiveTickets);
      const checkoutSpy = vi
        .spyOn(component.facade, "checkOutWithTicket")
        .mockImplementation(() => {});

      component.facade.onQrScanned({ ticketId: "t-1" });

      expect(checkoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: "t-1" })
      );
      expect(component.facade.isQrScannerOpen()).toBe(false);
    });

    it("should show error toast and never create check-in when scanned ticket is not found in active tickets", () => {
      component.facade.onQrScanned({ ticketId: "nonexistent-ticket-id" });

      expect(toastSpy.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            "no encontrado en taquilla o ya fue liquidado"
          ),
          type: "error",
        })
      );
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();
      expect(component.facade.isCheckOutModalOpen()).toBe(false);
    });

    it("should show error toast if plate is empty on express check-in", () => {
      component.facade.expressPlate.set("   ");
      component.facade.submitExpressCheckIn();

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

    it("should reject express check-in if plate has less than 3 alphanumeric characters", () => {
      component.facade.expressPlate.set("AB");
      component.facade.submitExpressCheckIn();

      expect(toastSpy.showToast).toHaveBeenCalledWith({
        message: "Por favor ingresa una placa válida.",
        type: "error",
      });
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();

      toastSpy.showToast.mockClear();
      component.facade.expressPlate.set("-.-");
      component.facade.submitExpressCheckIn();

      expect(toastSpy.showToast).toHaveBeenCalledWith({
        message: "Por favor ingresa una placa válida.",
        type: "error",
      });
      expect(ticketServiceSpy.createTicket).not.toHaveBeenCalled();
    });

    it("should show error toast if no slots are available for requested vehicle type", () => {
      // Set vehicle type to one without rate or slot
      component.facade.expressPlate.set("ABC123");
      component.facade.submitExpressCheckIn("ABC123", "BIKE");

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
      const [availableSlot] = component.facade.slots();
      expect(availableSlot.status).toBe("AVAILABLE");

      component.facade.onSlotClick(availableSlot);

      expect(component.facade.selectedCheckInSlot()).toEqual(availableSlot);
      expect(component.facade.isCheckInModalOpen()).toBe(true);

      // Closing modal clears preselected slot
      component.facade.closeCheckInModal();
      expect(component.facade.selectedCheckInSlot()).toBeNull();
      expect(component.facade.isCheckInModalOpen()).toBe(false);
    });

    it("should trigger check-out when onSlotClick is called on an occupied slot", () => {
      const [, occupiedSlot] = component.facade.slots();
      expect(occupiedSlot.status).toBe("OCCUPIED");

      const checkOutSpy = vi
        .spyOn(component.facade, "checkOutSpecificSlot")
        .mockImplementation(() => {});
      component.facade.onSlotClick(occupiedSlot);

      expect(checkOutSpy).toHaveBeenCalledWith(occupiedSlot);
    });

    it("should do nothing when onSlotClick is called on a slot that is neither available nor occupied", () => {
      const maintenanceSlot = {
        ...component.facade.slots()[0],
        status: "MAINTENANCE" as const,
      };
      const checkInSpy = vi.spyOn(component.facade, "checkInSpecificSlot");
      const checkOutSpy = vi.spyOn(component.facade, "checkOutSpecificSlot");

      component.facade.onSlotClick(maintenanceSlot);

      expect(checkInSpy).not.toHaveBeenCalled();
      expect(checkOutSpy).not.toHaveBeenCalled();
    });

    it("should render clean tap cards with accessible attributes and footer badges", () => {
      component.facade.activeTickets.set([
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
      expect(fixture.nativeElement.textContent).toContain("Asignar bahía");
      // Verify occupied card footer
      expect(fixture.nativeElement.textContent).toContain("Cobrar Salida");
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
        component.facade.activeTickets.set(mockTickets);
      });

      it("should open direct checkout modal if query is empty", () => {
        const directCheckOutSpy = vi.spyOn(
          component.facade,
          "openDirectCheckOutModal"
        );
        component.facade.setSearchTicketQuery("");
        component.facade.submitExpressCheckOutByQuery();

        expect(directCheckOutSpy).toHaveBeenCalled();
        expect(component.facade.isCheckOutModalOpen()).toBe(true);
        expect(component.facade.selectedCheckoutTicket()).toBeNull();
      });

      it("should open checkout modal directly when query has a single unique match", () => {
        component.facade.setSearchTicketQuery("XYZ");
        component.facade.submitExpressCheckOutByQuery();

        expect(component.facade.selectedCheckoutTicket()).toEqual(
          mockTickets[1]
        );
        expect(component.facade.isCheckOutModalOpen()).toBe(true);
      });

      it("should open checkout modal when query has an exact match even among multiple matches", () => {
        component.facade.setSearchTicketQuery("101");
        component.facade.submitExpressCheckOutByQuery();

        expect(component.facade.selectedCheckoutTicket()).toEqual(
          mockTickets[0]
        );
        expect(component.facade.isCheckOutModalOpen()).toBe(true);
      });

      it("should match ticket with hyphenated search query (e.g. 'EXP-123' matching 'EXP123') in express checkout", () => {
        const expTicket = {
          entryTime: "2026-10-16T11:00:00Z",
          id: "t-exp",
          licensePlate: "EXP123",
          slotNumber: "105",
          status: "OPEN" as const,
        };
        component.facade.activeTickets.set([...mockTickets, expTicket]);

        component.facade.setSearchTicketQuery("EXP-123");
        component.facade.submitExpressCheckOutByQuery();

        expect(component.facade.selectedCheckoutTicket()).toEqual(expTicket);
        expect(component.facade.isCheckOutModalOpen()).toBe(true);
      });

      it("should show warning toast when multiple matches are found without exact match", () => {
        component.facade.activeTickets.set([
          { ...mockTickets[0], licensePlate: "ABC-100" },
          { ...mockTickets[1], licensePlate: "ABC-200" },
        ]);
        component.facade.setSearchTicketQuery("ABC");
        component.facade.submitExpressCheckOutByQuery();

        expect(toastSpy.showToast).toHaveBeenCalledWith({
          message: "Múltiples vehículos coinciden. Selecciona uno de la lista.",
          type: "warning",
        });
        expect(component.facade.isCheckOutModalOpen()).toBe(false);
      });

      it("should show error toast when no active vehicles match the query", () => {
        component.facade.setSearchTicketQuery("NONEXISTENT");
        component.facade.submitExpressCheckOutByQuery();

        expect(toastSpy.showToast).toHaveBeenCalledWith({
          message: "No se encontró ningún vehículo activo con ese criterio.",
          type: "error",
        });
        expect(component.facade.isCheckOutModalOpen()).toBe(false);
      });
    });

    describe("checkoutTicketId query parameter navigation bridge", () => {
      it("should automatically trigger checkOutWithTicket when checkoutTicketId matches an active ticket loaded asynchronously", () => {
        const targetTicket: TicketSummary = {
          entryTime: "2026-10-16T10:00:00Z",
          id: "ticket-target-99",
          licensePlate: "BRG123",
          slotNumber: "101",
          status: "OPEN",
        };

        const ticketsSubject = new Subject<TicketSummary[]>();
        ticketServiceSpy.listTicketsByParkingLot.mockReturnValue(
          ticketsSubject.asObservable()
        );

        const queryParamSubject = new BehaviorSubject(
          convertToParamMap({ checkoutTicketId: "ticket-target-99" })
        );

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [OperationsPageComponent],
          providers: [
            provideRouter([]),
            {
              provide: ActivatedRoute,
              useValue: {
                paramMap: of(convertToParamMap({ parkingId: "p-1" })),
                queryParamMap: queryParamSubject.asObservable(),
              },
            },
            { provide: ParkingService, useValue: parkingServiceSpy },
            { provide: SlotService, useValue: slotServiceSpy },
            { provide: RateService, useValue: rateServiceSpy },
            { provide: TicketService, useValue: ticketServiceSpy },
            { provide: ToastService, useValue: toastSpy },
          ],
        });

        const customFixture = TestBed.createComponent(OperationsPageComponent);
        const customComp = customFixture.componentInstance;
        customFixture.detectChanges();

        const checkOutSpy = vi.spyOn(customComp.facade, "checkOutWithTicket");

        // Before async tickets emit, checkOutWithTicket should not be called
        expect(checkOutSpy).not.toHaveBeenCalled();

        // Emit active tickets asynchronously
        ticketsSubject.next([targetTicket]);
        customFixture.detectChanges();

        expect(checkOutSpy).toHaveBeenCalledWith(targetTicket);
        expect(customComp.facade.selectedCheckoutTicket()).toEqual(
          targetTicket
        );
        expect(customComp.facade.isCheckOutModalOpen()).toBe(true);
      });

      it("should trigger checkOutWithTicket immediately if tickets are already loaded when queryParam arrives", () => {
        const targetTicket: TicketSummary = {
          entryTime: "2026-10-16T10:00:00Z",
          id: "ticket-target-55",
          licensePlate: "IMM555",
          slotNumber: "102",
          status: "OPEN",
        };

        ticketServiceSpy.listTicketsByParkingLot.mockReturnValue(
          of([targetTicket])
        );

        const queryParamSubject = new BehaviorSubject(
          convertToParamMap({ checkoutTicketId: "ticket-target-55" })
        );

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [OperationsPageComponent],
          providers: [
            provideRouter([]),
            {
              provide: ActivatedRoute,
              useValue: {
                paramMap: of(convertToParamMap({ parkingId: "p-1" })),
                queryParamMap: queryParamSubject.asObservable(),
              },
            },
            { provide: ParkingService, useValue: parkingServiceSpy },
            { provide: SlotService, useValue: slotServiceSpy },
            { provide: RateService, useValue: rateServiceSpy },
            { provide: TicketService, useValue: ticketServiceSpy },
            { provide: ToastService, useValue: toastSpy },
          ],
        });

        const customFixture = TestBed.createComponent(OperationsPageComponent);
        const customComp = customFixture.componentInstance;
        customFixture.detectChanges();

        expect(customComp.facade.selectedCheckoutTicket()).toEqual(
          targetTicket
        );
        expect(customComp.facade.isCheckOutModalOpen()).toBe(true);
      });

      it("should NOT trigger checkOutWithTicket if checkoutTicketId does not match any active ticket", () => {
        const otherTicket: TicketSummary = {
          entryTime: "2026-10-16T10:00:00Z",
          id: "ticket-other-1",
          licensePlate: "OTH111",
          slotNumber: "103",
          status: "OPEN",
        };

        ticketServiceSpy.listTicketsByParkingLot.mockReturnValue(
          of([otherTicket])
        );

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [OperationsPageComponent],
          providers: [
            provideRouter([]),
            {
              provide: ActivatedRoute,
              useValue: {
                paramMap: of(convertToParamMap({ parkingId: "p-1" })),
                queryParamMap: of(
                  convertToParamMap({ checkoutTicketId: "nonexistent-id" })
                ),
              },
            },
            { provide: ParkingService, useValue: parkingServiceSpy },
            { provide: SlotService, useValue: slotServiceSpy },
            { provide: RateService, useValue: rateServiceSpy },
            { provide: TicketService, useValue: ticketServiceSpy },
            { provide: ToastService, useValue: toastSpy },
          ],
        });

        const customFixture = TestBed.createComponent(OperationsPageComponent);
        const customComp = customFixture.componentInstance;
        customFixture.detectChanges();

        expect(customComp.facade.selectedCheckoutTicket()).toBeNull();
        expect(customComp.facade.isCheckOutModalOpen()).toBe(false);
      });
    });
  });

  it("should not pass stale expressPlate to check-in modal when opened in unplated mode", () => {
    component.facade.expressPlate.set("ABC-123");
    component.facade.openCheckInModal(true);
    fixture.detectChanges();

    const modalDebugEl = fixture.debugElement.query(
      By.css("app-check-in-modal")
    );
    const modalInstance = modalDebugEl.componentInstance as {
      initialPlate: () => string;
      initialUnplated: () => boolean;
      facade: { isUnplated: () => boolean; plate: () => string };
    };

    expect(modalInstance.initialUnplated()).toBe(true);
    expect(modalInstance.initialPlate()).toBe("");
    expect(modalInstance.facade.isUnplated()).toBe(true);
    expect(modalInstance.facade.plate()).toBe("");
  });

  it("should clear expressPlate when check-in modal closes so subsequent slot clicks do not inherit stale plate", () => {
    component.facade.expressPlate.set("ABC-123");
    component.facade.submitExpressCheckIn();
    expect(component.facade.isCheckInModalOpen()).toBe(true);

    component.facade.closeCheckInModal();
    expect(component.facade.expressPlate()).toBe("");

    const [availableSlot] = component.facade.slots();
    component.facade.onSlotClick(availableSlot);
    expect(component.facade.checkInModalInitialPlate()).toBe("");
  });

  it("should default expressVehicleType to MOTORCYCLE for motorcycle-only parking lots and submit check-in cleanly", () => {
    slotServiceSpy.summaries = () => ({
      "p-1": [
        {
          id: "m-1",
          parkingName: "Solo Motos",
          prefix: "M",
          slotNumber: "01",
          status: "AVAILABLE",
          type: "MOTORCYCLE",
          zone: "Z1",
        },
      ],
    });
    rateServiceSpy.ratesByParking = () => ({
      "p-1": [
        {
          createdAt: "",
          description: "",
          id: "r-moto",
          minChargeTimeMinutes: 15,
          name: "Tarifa Moto",
          parkingId: "p-1",
          pricePerUnit: 2000,
          timeUnit: "HOURS",
          updatedAt: "",
          vehicleType: "MOTORCYCLE",
        },
      ],
    });

    const motoFixture = TestBed.createComponent(OperationsPageComponent);
    const motoComp = motoFixture.componentInstance;
    motoFixture.detectChanges();

    expect(motoComp.facade.hasMultipleVehicleTypes()).toBe(false);
    expect(motoComp.facade.expressVehicleType()).toBe("MOTORCYCLE");

    motoComp.facade.expressPlate.set("ABC12D");
    motoComp.facade.submitExpressCheckIn();

    expect(motoComp.facade.isCheckInModalOpen()).toBe(true);
    expect(motoComp.facade.selectedCheckInSlot()?.id).toBe("m-1");
    expect(toastSpy.showToast).not.toHaveBeenCalled();
  });

  it("should default expressVehicleType to BIKE for bike-only parking lots and submit check-in cleanly", () => {
    slotServiceSpy.summaries = () => ({
      "p-1": [
        {
          id: "b-1",
          parkingName: "Biciparqueadero",
          prefix: "B",
          slotNumber: "01",
          status: "AVAILABLE",
          type: "BIKE",
          zone: "Z1",
        },
      ],
    });
    rateServiceSpy.ratesByParking = () => ({
      "p-1": [
        {
          createdAt: "",
          description: "",
          id: "r-bike",
          minChargeTimeMinutes: 15,
          name: "Tarifa Bici",
          parkingId: "p-1",
          pricePerUnit: 1000,
          timeUnit: "HOURS",
          updatedAt: "",
          vehicleType: "BIKE",
        },
      ],
    });

    const bikeFixture = TestBed.createComponent(OperationsPageComponent);
    const bikeComp = bikeFixture.componentInstance;
    bikeFixture.detectChanges();

    expect(bikeComp.facade.hasMultipleVehicleTypes()).toBe(false);
    expect(bikeComp.facade.expressVehicleType()).toBe("BIKE");

    bikeComp.facade.expressPlate.set("BIK123");
    bikeComp.facade.submitExpressCheckIn();

    expect(bikeComp.facade.isCheckInModalOpen()).toBe(true);
    expect(bikeComp.facade.selectedCheckInSlot()?.id).toBe("b-1");
  });

  it("should allow 1-char bay search on Enter in omnibar and guard empty/invalid express check-in form submit", () => {
    fixture.detectChanges();
    const checkOutSpy = vi.spyOn(
      component.facade,
      "submitExpressCheckOutByQuery"
    );
    const checkInSpy = vi.spyOn(component.facade, "submitExpressCheckIn");

    // 1-char bay query on Enter triggers checkout
    component.facade.searchTicketQuery.set("1");
    fixture.detectChanges();
    const searchInput = fixture.nativeElement.querySelector(
      "#search-ticket-checkout"
    ) as HTMLInputElement;
    searchInput.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
    );
    expect(checkOutSpy).toHaveBeenCalledTimes(1);

    // Express plate input must not truncate 9-char Venezuelan plates (no maxlength="8")
    const plateInput = fixture.nativeElement.querySelector(
      "#express-plate-input"
    ) as HTMLInputElement;
    expect(plateInput.getAttribute("maxlength")).toBeNull();

    // Form submit with empty or invalid plate must not emit submitExpressCheckIn
    const form = plateInput.closest("form") as HTMLFormElement;
    component.facade.expressPlate.set("");
    fixture.detectChanges();
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(checkInSpy).not.toHaveBeenCalled();

    component.facade.expressPlate.set("AB");
    fixture.detectChanges();
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(checkInSpy).not.toHaveBeenCalled();
  });
});
