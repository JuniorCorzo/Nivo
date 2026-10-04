import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import {
  provideRouter,
  ActivatedRoute,
  convertToParamMap,
} from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { SlotStatus, SlotSummary } from "@core/models/slot.model";
import { NavigationContextService } from "@core/services/navigation-context.service";
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";

import {
  ParkingSlotsListFacade,
  getDeleteModalCopy,
  getHistoryCopy,
  getStatusModalCopy,
  getStatusTransitionOptions,
  requiresDeleteConfirm,
  VALID_STATUS_TRANSITIONS,
} from "../../facades/parking-slots-list.facade";
import { ParkingSlotsListPage } from "./parking-slots-list";

const mockParking = (
  overrides: Partial<ParkingLotListItemModel> = {}
): ParkingLotListItemModel => ({
  address: { city: "", country: "", state: "", street: "", zipCode: "" },
  coordinates: { latitude: 0, longitude: 0 },
  createdAt: "",
  currency: "COP",
  id: "parking-1",
  name: "Parqueadero Norte",
  occuppationRate: 0,
  ownerName: "Admin",
  slotDistribution: [],
  totalCapacity: 10,
  updatedAt: "",
  ...overrides,
});

const mockSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Parqueadero Norte",
  prefix: "A",
  slotNumber: "A-001",
  status: "AVAILABLE",
  type: "CAR",
  zone: "NORTE",
  ...overrides,
});

const mockActivatedRoute = (parkingId: string, slotId?: string) => {
  const params: Record<string, string> = slotId
    ? { parkingId, slotId }
    : { parkingId };
  return {
    paramMap: of(convertToParamMap(params)),
    snapshot: { paramMap: convertToParamMap(params) },
  };
};

const setupTest = (opts: {
  parkings?: ParkingLotListItemModel[];
  slotSummaries?: SlotSummary[];
  parkingId?: string;
}) => {
  const parkings = opts.parkings ?? [mockParking()];
  const slots = opts.slotSummaries ?? [];
  const parkingId = opts.parkingId ?? "parking-1";

  const parkingService = {
    parkingLots: signal(parkings).asReadonly(),
  };

  const summariesSignal = signal<Record<string, SlotSummary[]>>({
    [parkingId]: slots,
  });

  const slotService = {
    delete: vi.fn(),
    getAllSlotSummariesByParkingId: vi.fn().mockReturnValue(of(slots)),
    summaries: summariesSignal.asReadonly(),
    update: vi.fn(),
    updateSlotGroup: vi.fn().mockReturnValue(of([])),
    updateSlotMetadata: vi.fn().mockReturnValue(of([])),
  };

  const toastService = {
    showToast: vi.fn(),
  };
  const routeMock = mockActivatedRoute(parkingId);
  const parkingName = parkings.find((p) => p.id === parkingId)?.name;
  const navContextService = {
    backLink: signal("/app/parking-lots"),
    breadcrumbs: signal([
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideParkingSquare",
        isParking: undefined,
        label: "Parqueaderos",
        url: "/app/parking-lots",
      },
      ...(parkingName
        ? [
            {
              icon: "lucideBuilding2",
              isParking: true,
              label: parkingName,
              url: "/app/parking-lots",
            },
            {
              icon: "lucideLayoutGrid",
              isParking: undefined,
              label: "Plazas",
              url: undefined,
            },
          ]
        : []),
    ]),
    isRoot: signal(false),
    mobilePath: signal(
      parkingName
        ? `Home / Parqueaderos / ${parkingName} / Plazas`
        : "Home / Parqueaderos"
    ),
    navContext: signal({
      backLink: "/app/parking-lots",
      scope: "parking",
      section: "Plazas",
      title: "Plazas",
    }),
    scope: signal("parking"),
  };

  return {
    parkingService,
    providers: [
      provideRouter([]),
      { provide: SlotService, useValue: slotService },
      { provide: ParkingService, useValue: parkingService },
      { provide: ToastService, useValue: toastService },
      { provide: ActivatedRoute, useValue: routeMock },
      { provide: NavigationContextService, useValue: navContextService },
      ParkingSlotsListFacade,
    ],
    routeMock,
    slotService,
    toastService,
  };
};

describe("ParkingSlotsListPage — Integration", () => {
  let fixture: ComponentFixture<ParkingSlotsListPage>;

  // ── Spec: Slots list page — Visualización del listado ───────────────

  describe("List rendering with slots", () => {
    beforeEach(async () => {
      const config = setupTest({
        slotSummaries: [
          mockSlot({
            id: "1",
            slotNumber: "A-001",
            status: "AVAILABLE",
            type: "CAR",
          }),
          mockSlot({
            id: "2",
            slotNumber: "A-002",
            status: "OCCUPIED",
            type: "MOTORCYCLE",
          }),
          mockSlot({
            id: "3",
            slotNumber: "A-003",
            status: "AVAILABLE",
            type: "ELECTRIC_VEHICLE",
          }),
          mockSlot({
            id: "4",
            slotNumber: "A-004",
            status: "AVAILABLE",
            type: "DISABLED",
          }),
        ],
      });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      fixture.detectChanges();
    });

    it("should render breadcrumb with parking name", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Parqueadero Norte");
      expect(text).toContain("Plazas");
    });

    it("should render app-page-header with title and actions", () => {
      const header = fixture.nativeElement.querySelector("app-page-header");
      expect(header).toBeTruthy();
      expect(header.textContent).toContain("Plazas de Parqueo");
      const actions = header.querySelector("[actions]");
      expect(actions).toBeTruthy();
      expect(actions.textContent).toContain("Crear plazas");
    });

    it("should render search input", () => {
      const search = fixture.nativeElement.querySelector(
        'input[type="search"]'
      );
      expect(search).toBeTruthy();
    });

    it("should render filter selects", () => {
      const selects = fixture.nativeElement.querySelectorAll("nv-select");
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });

    it("should show create button", () => {
      expect(fixture.nativeElement.textContent).toContain("Crear plazas");
    });

    it("should render table with slot data", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("A-001");
      expect(text).toContain("A-002");
      expect(text).toContain("A-003");
      expect(text).toContain("A-004");
    });

    it("should render all 8 table column headers", () => {
      const headers =
        fixture.nativeElement.querySelectorAll("th[nv-table-head]");
      expect(headers.length).toBe(8);
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Número");
      expect(text).toContain("Zona");
      expect(text).toContain("Tipo Vehículo");
      expect(text).toContain("Tipo Slot");
      expect(text).toContain("Discapacitado / PMR");
      expect(text).toContain("Estado");
      expect(text).toContain("Acciones");
    });

    it("should render proper type labels for vehicle types", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Carro");
      expect(text).toContain("Moto");
      expect(text).toContain("Eléctrico");
      expect(text).toContain("Discapacitado");
    });

    it("should show pagination info", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Mostrando");
    });
  });

  // ── Spec: Empty states — Sin plazas configuradas ────────────────────

  describe("Empty state: no slots configured", () => {
    beforeEach(async () => {
      const config = setupTest({ slotSummaries: [] });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      fixture.detectChanges();
    });

    it('should show "No hay plazas configuradas" message', () => {
      expect(fixture.nativeElement.textContent).toContain(
        "No hay plazas configuradas"
      );
    });

    it("should show CTA to create first batch", () => {
      expect(fixture.nativeElement.textContent).toContain("Crear primer lote");
    });
  });

  // ── Spec: Empty states — Filtros vacíos ─────────────────────────────

  describe("Empty state: filters produce empty result", () => {
    beforeEach(async () => {
      const config = setupTest({
        slotSummaries: [mockSlot({ id: "1", slotNumber: "A-001" })],
      });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      fixture.detectChanges();
    });

    it("should render data when slots exist", () => {
      expect(fixture.nativeElement.textContent).toContain("A-001");
    });

    it("should have action buttons on rows", () => {
      const buttons = fixture.nativeElement.querySelectorAll(
        "td[nv-table-cell] button"
      );
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ── Spec: Slot detail drawer — Abrir detalle ────────────────────────

  describe("Drawer and row actions", () => {
    beforeEach(async () => {
      const config = setupTest({
        slotSummaries: [
          mockSlot({
            id: "1",
            slotNumber: "A-001",
            status: "AVAILABLE",
            type: "CAR",
            zone: "NORTE",
          }),
        ],
      });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      fixture.detectChanges();
    });

    it("should have detail button per row", () => {
      const buttons = fixture.nativeElement.querySelectorAll("button");
      const titles = Array.from(buttons, (b: HTMLButtonElement) =>
        b.getAttribute("title")
      );
      expect(titles).toContain("Ver detalle");
    });

    it("should have row action buttons for edit, status, delete", () => {
      const buttons = fixture.nativeElement.querySelectorAll("button");
      const titles = Array.from(buttons, (b: HTMLButtonElement) =>
        b.getAttribute("title")
      );
      expect(titles).toContain("Editar");
      expect(titles).toContain("Cambiar estado");
      expect(titles).toContain("Eliminar");
    });
  });

  // ── Spec: Status change modal — Opciones por estado actual ──────────

  describe("Status modal rendering", () => {
    let facade: ParkingSlotsListFacade;

    beforeEach(async () => {
      const slot = mockSlot({
        id: "1",
        slotNumber: "A-001",
        status: "AVAILABLE",
      });
      const config = setupTest({ slotSummaries: [slot] });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      facade = fixture.debugElement.injector.get(ParkingSlotsListFacade);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should open status modal with title", () => {
      const slot = mockSlot({ id: "1", status: "AVAILABLE" });
      facade.openStatusModal(slot);
      fixture.detectChanges();

      expect(facade.statusModalOpen()).toBe(true);
      expect(fixture.nativeElement.textContent).toContain("Cambiar estado");
    });

    it("should show valid transitions for AVAILABLE status", () => {
      const slot = mockSlot({ id: "1", status: "AVAILABLE" });
      facade.openStatusModal(slot);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain("Ocupada");
      expect(fixture.nativeElement.textContent).toContain("Mantenimiento");
      expect(fixture.nativeElement.textContent).toContain("Reservada");
    });

    it("should close status modal", () => {
      const slot = mockSlot({ id: "1", status: "AVAILABLE" });
      facade.openStatusModal(slot);
      facade.closeStatusModal();
      fixture.detectChanges();

      expect(facade.statusModalOpen()).toBe(false);
    });
  });

  // ── Spec: Delete modal — Eliminación sin/con historial ──────────────

  describe("Delete modal behavior", () => {
    let facade: ParkingSlotsListFacade;

    beforeEach(async () => {
      const slot = mockSlot({
        hasHistory: false,
        id: "1",
        slotNumber: "A-001",
        status: "AVAILABLE",
      });
      const config = setupTest({ slotSummaries: [slot] });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      facade = fixture.debugElement.injector.get(ParkingSlotsListFacade);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should open delete modal without confirmation checkbox when no history", () => {
      const slot = mockSlot({ hasHistory: false, id: "1" });
      facade.openDeleteModal(slot);
      fixture.detectChanges();

      expect(facade.deleteModalOpen()).toBe(true);
      expect(fixture.nativeElement.textContent).toContain("Eliminar plaza");
    });

    it("should require checkbox when slot has history", () => {
      const slot = mockSlot({ hasHistory: true, id: "1" });
      facade.openDeleteModal(slot);
      fixture.detectChanges();

      expect(facade.deleteRequiresConfirm()).toBe(true);
      expect(fixture.nativeElement.textContent).toContain("Entiendo el riesgo");
    });

    it("should close delete modal", () => {
      const slot = mockSlot({ hasHistory: false, id: "1" });
      facade.openDeleteModal(slot);
      facade.closeDeleteModal();
      fixture.detectChanges();

      expect(facade.deleteModalOpen()).toBe(false);
    });
  });

  // ── Spec: Navigation and breadcrumb — Contexto de parqueadero ───────

  describe("Navigation and breadcrumb", () => {
    beforeEach(async () => {
      const config = setupTest({
        slotSummaries: [mockSlot({ id: "1", slotNumber: "A-001" })],
      });

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      fixture.detectChanges();
    });

    it("should show breadcrumb with parking context", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Parqueaderos");
      expect(text).toContain("Parqueadero Norte");
      expect(text).toContain("Plazas");
    });

    it("should have navigation breadcrumb links", () => {
      const links = fixture.nativeElement.querySelectorAll(
        '[data-testid="page-header-breadcrumb"] a'
      );
      expect(links.length).toBe(3);
      expect(links[0].textContent).toContain("Home");
      expect(links[1].textContent).toContain("Parqueaderos");
      expect(links[2].textContent).toContain("Parqueadero Norte");
    });

    it("should show empty state when parking is not found", () => {
      TestBed.resetTestingModule();
      const emptyConfig = setupTest({ parkingId: "nonexistent", parkings: [] });
      TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: emptyConfig.providers,
      });
      const emptyFixture = TestBed.createComponent(ParkingSlotsListPage);
      emptyFixture.detectChanges();
      expect(emptyFixture.nativeElement.textContent).toContain(
        "Parqueadero no encontrado"
      );
    });
  });

  // ── Spec: Badges & Batch Metadata Modal ─────────────────────────────

  describe("Slot metadata badges and batch modal", () => {
    let facade: ParkingSlotsListFacade;
    let slotServiceMock: { updateSlotMetadata: ReturnType<typeof vi.fn> };
    let toastServiceMock: { showToast: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      const config = setupTest({
        slotSummaries: [
          mockSlot({
            hasCharger: true,
            id: "1",
            isAccessible: true,
            isActive: false,
            slotNumber: "A-001",
            status: "AVAILABLE",
          }),
        ],
      });
      slotServiceMock = config.slotService;
      toastServiceMock = config.toastService;

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      facade = fixture.debugElement.injector.get(ParkingSlotsListFacade);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should render EV, PMR, and inactive badges when slot metadata flags are set", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("eléctrico");
      expect(text).toContain("PMR");
      expect(text).toContain("Inactiva");
    });

    it("should render equipment and accessibility section in slot detail drawer", () => {
      facade.drawerSlotId.set("1");
      fixture.detectChanges();

      const drawer = fixture.nativeElement.querySelector(
        "app-slot-detail-drawer"
      );
      expect(drawer).toBeTruthy();
      const text = drawer.textContent ?? "";
      expect(text).toContain("Equipamiento y disponibilidad");
      expect(text).toContain("Cargador EV");
      expect(text).toContain("⚡ EV");
      expect(text).toContain("Movilidad Reducida");
      expect(text).toContain("♿ PMR");
      expect(text).toContain("Estado de Operación");
      expect(text).toContain("⏸️ Fuera de servicio");
    });

    it("should display 'Editar equipamiento (N)' button when slots are selected and open modal on click", () => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      const changeEvent = new Event("change");
      checkbox.dispatchEvent(changeEvent);
      facade.toggleSelected("1", changeEvent);
      fixture.detectChanges();

      const batchText = fixture.nativeElement.textContent ?? "";
      expect(batchText).toContain("Editar equipamiento (1)");

      facade.openMetadataModal();
      fixture.detectChanges();

      expect(facade.metadataModalOpen()).toBe(true);
      const modal = fixture.nativeElement.querySelector(
        "app-slot-metadata-batch-modal"
      );
      expect(modal).toBeTruthy();
    });

    it("should delegate updateSlotsMetadata to slotService and show success toast", () => {
      facade.openMetadataModal();
      fixture.detectChanges();

      facade.updateSlotsMetadata({
        hasCharger: true,
        isAccessible: true,
        isActive: true,
        slotIds: ["1"],
      });

      expect(slotServiceMock.updateSlotMetadata).toHaveBeenCalledWith({
        hasCharger: true,
        isAccessible: true,
        isActive: true,
        slotIds: ["1"],
      });
      expect(facade.metadataModalOpen()).toBe(false);
      expect(toastServiceMock.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
        })
      );
    });

    it("should extract specific error message on updateSlotsMetadata failure", () => {
      slotServiceMock.updateSlotMetadata.mockReturnValue(
        throwError(() => ({
          error: { message: "Error específico de equipamiento" },
        }))
      );

      facade.updateSlotsMetadata({
        slotIds: ["1"],
      });

      expect(toastServiceMock.showToast).toHaveBeenCalledWith({
        message: "Error específico de equipamiento",
        type: "error",
      });
    });
  });

  // ── Spec: Group Edit Modal ──────────────────────────────────────────

  describe("Slot group edit modal", () => {
    let facade: ParkingSlotsListFacade;
    let slotServiceMock: { updateSlotGroup: ReturnType<typeof vi.fn> };
    let toastServiceMock: { showToast: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
      const config = setupTest({
        parkingId: "parking-1",
        slotSummaries: [
          mockSlot({
            id: "1",
            prefix: "A",
            slotNumber: "A-001",
            zone: "NORTE",
          }),
        ],
      });
      slotServiceMock = config.slotService;
      toastServiceMock = config.toastService;

      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: config.providers,
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingSlotsListPage);
      facade = fixture.debugElement.injector.get(ParkingSlotsListFacade);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should compute availableGroups correctly from slots", () => {
      expect(facade.availableGroups()).toEqual([
        { count: 1, occupiedCount: 0, prefix: "A", zone: "NORTE" },
      ]);
    });

    it("should show 'Editar grupo' button and open group modal on click", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Editar grupo");

      facade.openGroupModal("NORTE", "A");
      fixture.detectChanges();

      expect(facade.groupModalOpen()).toBe(true);
      const modal = fixture.nativeElement.querySelector(
        "app-slot-group-edit-modal"
      );
      expect(modal).toBeTruthy();
    });

    it("should delegate updateSlotGroup to slotService and show success toast", () => {
      facade.openGroupModal("NORTE", "A");
      fixture.detectChanges();

      facade.updateSlotGroup({
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "SUR",
        parkingId: "parking-1",
      });

      expect(slotServiceMock.updateSlotGroup).toHaveBeenCalledWith({
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "SUR",
        parkingId: "parking-1",
      });
      expect(facade.groupModalOpen()).toBe(false);
      expect(toastServiceMock.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
        })
      );
    });

    it("should show error toast and not call service when group has occupied slots", async () => {
      TestBed.resetTestingModule();
      const occupiedConfig = setupTest({
        parkingId: "parking-1",
        slotSummaries: [
          mockSlot({
            id: "1",
            prefix: "A",
            slotNumber: "A-001",
            status: "OCCUPIED",
            zone: "NORTE",
          }),
        ],
      });
      await TestBed.configureTestingModule({
        imports: [ParkingSlotsListPage],
        providers: occupiedConfig.providers,
      }).compileComponents();

      const occupiedFixture = TestBed.createComponent(ParkingSlotsListPage);
      const occupiedFacade = occupiedFixture.debugElement.injector.get(
        ParkingSlotsListFacade
      );
      occupiedFixture.detectChanges();
      await occupiedFixture.whenStable();

      expect(occupiedFacade.availableGroups()).toEqual([
        { count: 1, occupiedCount: 1, prefix: "A", zone: "NORTE" },
      ]);

      occupiedFacade.updateSlotGroup({
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "SUR",
        parkingId: "parking-1",
      });

      expect(occupiedConfig.slotService.updateSlotGroup).not.toHaveBeenCalled();
      expect(occupiedConfig.toastService.showToast).toHaveBeenCalledWith({
        message:
          "No se puede modificar el grupo porque contiene plazas ocupadas o no disponibles.",
        type: "error",
      });
    });

    it("should extract specific error message on updateSlotGroup failure", () => {
      slotServiceMock.updateSlotGroup.mockReturnValue(
        throwError(() => ({
          error: { message: "No se puede renombrar el grupo" },
        }))
      );

      facade.updateSlotGroup({
        currentPrefix: "A",
        currentZone: "NORTE",
        newPrefix: "B",
        newZone: "SUR",
        parkingId: "parking-1",
      });

      expect(toastServiceMock.showToast).toHaveBeenCalledWith({
        message: "No se puede renombrar el grupo",
        type: "error",
      });
    });
  });
});

// ── Pure Function Safety Net (re-export verification) ──────────────────

describe("ParkingSlotsListPage — Pure Function Safety Net", () => {
  const s = (overrides: Partial<SlotSummary> = {}): SlotSummary =>
    mockSlot(overrides);

  describe("getDeleteModalCopy", () => {
    it("batch scope → batch message", () => {
      expect(getDeleteModalCopy(s(), "batch")).toContain(
        "Hay plazas seleccionadas"
      );
    });
    it("single, no history → simple", () => {
      const result = getDeleteModalCopy(s({ hasHistory: false }), "single");
      expect(result).toContain("¿Eliminar la plaza");
      expect(result).not.toContain("historial");
    });
    it("single, has history → warning", () => {
      expect(getDeleteModalCopy(s({ hasHistory: true }), "single")).toContain(
        "historial"
      );
    });
    it("null → default", () => {
      expect(getDeleteModalCopy(null, "single")).toBe(
        "Seleccioná una plaza para eliminar."
      );
    });
  });

  describe("requiresDeleteConfirm", () => {
    it("false when hasHistory=false", () =>
      expect(requiresDeleteConfirm(s({ hasHistory: false }))).toBe(false));
    it("true when hasHistory=true", () =>
      expect(requiresDeleteConfirm(s({ hasHistory: true }))).toBe(true));
    it("true when undefined (safety)", () =>
      expect(requiresDeleteConfirm(s({ hasHistory: undefined }))).toBe(true));
    it("false for null", () => expect(requiresDeleteConfirm(null)).toBe(false));
  });

  describe("getStatusTransitionOptions", () => {
    it("AVAILABLE", () =>
      expect(getStatusTransitionOptions("AVAILABLE")).toEqual([
        "OCCUPIED",
        "MAINTENANCE",
        "RESERVED",
      ]));
    it("OCCUPIED", () =>
      expect(getStatusTransitionOptions("OCCUPIED")).toEqual([
        "AVAILABLE",
        "MAINTENANCE",
      ]));
    it("MAINTENANCE", () =>
      expect(getStatusTransitionOptions("MAINTENANCE")).toEqual(["AVAILABLE"]));
    it("RESERVED", () =>
      expect(getStatusTransitionOptions("RESERVED")).toEqual([
        "AVAILABLE",
        "OCCUPIED",
      ]));
    it("unknown → []", () => {
      /* SAFETY: Testing fallback for invalid status string */
      expect(getStatusTransitionOptions("UNKNOWN" as SlotStatus)).toEqual([]);
    });
  });

  describe("getStatusModalCopy", () => {
    it("normal → no extra confirm", () => {
      const r = getStatusModalCopy("AVAILABLE", "OCCUPIED", false);
      expect(r.title).toBe("Cambiar estado");
      expect(r.requiresExtraConfirm).toBe(false);
    });
    it("occupied→available with ticket → extra confirm", () => {
      const r = getStatusModalCopy("OCCUPIED", "AVAILABLE", true);
      expect(r.requiresExtraConfirm).toBe(true);
      expect(r.body).toContain("ticket activo");
    });
    it("occupied→available without ticket → no extra", () => {
      expect(
        getStatusModalCopy("OCCUPIED", "AVAILABLE", false).requiresExtraConfirm
      ).toBe(false);
    });
  });

  describe("getHistoryCopy", () => {
    it("no history → empty", () =>
      expect(getHistoryCopy(s({ hasHistory: false })).empty).toBe(true));
    it("has history → not empty", () => {
      const r = getHistoryCopy(s({ hasHistory: true }));
      expect(r.empty).toBe(false);
      expect(r.message).toContain("no está disponible");
    });
    it("null → empty", () => expect(getHistoryCopy(null).empty).toBe(true));
  });

  describe("VALID_STATUS_TRANSITIONS", () => {
    it("covers all statuses", () => {
      expect(Object.keys(VALID_STATUS_TRANSITIONS)).toEqual([
        "AVAILABLE",
        "MAINTENANCE",
        "OCCUPIED",
        "RESERVED",
      ]);
    });
  });
});
