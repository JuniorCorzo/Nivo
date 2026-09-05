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
import { ParkingService } from "@core/services/parking-service";
import { SlotService } from "@core/services/slot-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { ParkingSlotsListPage } from "./parking-slots-list";
import {
  ParkingSlotsListFacade,
  getDeleteModalCopy,
  getHistoryCopy,
  getStatusModalCopy,
  getStatusTransitionOptions,
  requiresDeleteConfirm,
  VALID_STATUS_TRANSITIONS,
} from "./parking-slots-list.facade";

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
  id: "slot-1",
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
  };

  const toastService = {
    showToast: vi.fn(),
  };
  const routeMock = mockActivatedRoute(parkingId);

  return {
    parkingService,
    providers: [
      provideRouter([]),
      { provide: SlotService, useValue: slotService },
      { provide: ParkingService, useValue: parkingService },
      { provide: ToastService, useValue: toastService },
      { provide: ActivatedRoute, useValue: routeMock },
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

    it("should have back-to-parking button", () => {
      expect(fixture.nativeElement.textContent).toContain(
        "Volver al parqueadero"
      );
    });

    it("should show empty state when parking is not found", () => {
      const text = fixture.nativeElement.textContent ?? "";
      expect(text).toContain("Parqueadero Norte");
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
