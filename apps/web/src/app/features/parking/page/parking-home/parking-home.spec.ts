import "@angular/compiler";
import { computed, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";

import { ParkingHomeFacade } from "../../facades/parking-home.facade";
import { ParkingHome } from "./parking-home";

describe("ParkingHome Component", () => {
  let component: ParkingHome;
  let fixture: ComponentFixture<ParkingHome>;
  let mockActiveParkingLotSignal: ReturnType<
    typeof signal<ParkingLotListItemModel | null>
  >;
  let mockFacade: Partial<ParkingHomeFacade>;

  const mockLot: ParkingLotListItemModel = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Calle 100 # 15-20",
      zipCode: "110111",
    },
    coordinates: { latitude: 4.6097, longitude: -74.0817 },
    createdAt: "2026-01-01T10:30:00Z",
    currency: "COP",
    id: "lot-1",
    name: "Parqueadero Central",
    occuppationRate: 40,
    ownerName: "Owner 1",
    slotDistribution: [{ count: 30, prefix: "A", type: "CAR", zone: "Norte" }],
    totalCapacity: 30,
    updatedAt: "2026-01-02T15:45:00Z",
  };

  beforeEach(async () => {
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(
      mockLot
    );
    mockFacade = {
      activeParkingLot: mockActiveParkingLotSignal,
      availableSlots: signal(18),
      isDeleteModalOpen: signal(false),
      occupiedSlots: signal(12),
      onCreateParking: vi.fn(),
      onDeleteCancel: vi.fn(),
      onDeleteClick: vi.fn(),
      onDeleteConfirm: vi.fn(),
      onEdit: vi.fn(),
      onManageOperations: vi.fn(),
      onManageRates: vi.fn(),
      onManageSlots: vi.fn(),
      selectedParkingId: signal<string | null>("lot-1"),
      totalSlots: signal(30),
    };

    await TestBed.configureTestingModule({
      imports: [ParkingHome],
      providers: [
        provideRouter([]),
        {
          provide: ParkingService,
          useValue: {
            parkingLots: signal([mockLot]),
          },
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingLot: mockActiveParkingLotSignal,
            activeParkingName: computed(
              () => mockActiveParkingLotSignal()?.name ?? ""
            ),
          },
        },
      ],
    })
      .overrideComponent(ParkingHome, {
        set: {
          providers: [{ provide: ParkingHomeFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ParkingHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should render parking stats and general info when active parking is present", () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector("app-parking-stats-grid")).toBeTruthy();
    expect(el.querySelector("app-parking-general-info")).toBeTruthy();
    expect(el.querySelector("app-parking-empty-state")).toBeNull();
  });

  it("should render app-page-header with parking selector, actions, and breadcrumbs", () => {
    const header = fixture.nativeElement.querySelector("app-page-header");
    expect(header).toBeTruthy();
    expect(header.textContent).toContain("Parqueadero Central");
    const selector = header.querySelector("app-parking-lot-selector");
    expect(selector).toBeTruthy();
    const actions = header.querySelector("[actions]");
    expect(actions).toBeTruthy();
    expect(header.textContent).toContain("⚡ Ir a Taquilla Directa");
    expect(header.textContent).toContain("Configurar Tarifas");
    expect(header.textContent).toContain("Editar Sede");
    expect(header.textContent).toContain("Calle 100 # 15-20, Bogotá");
    expect(header.textContent).not.toContain("Parqueadero Central — Calle 100");
    const breadcrumb = header.querySelector(
      '[data-testid="page-header-breadcrumb"]'
    );
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain("Home");
  });

  it("should trigger facade methods when clicking header action buttons", () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      "app-page-header [actions] nv-button"
    );
    expect(buttons.length).toBe(3);

    buttons[0].click();
    expect(mockFacade.onManageOperations).toHaveBeenCalled();

    buttons[1].click();
    expect(mockFacade.onManageRates).toHaveBeenCalled();

    buttons[2].click();
    expect(mockFacade.onEdit).toHaveBeenCalled();
  });

  it("should render hero map card with topbar, coordinates, and operational quick dock bar", () => {
    const native = fixture.nativeElement;
    expect(native.textContent).toContain("Mapa Georeferenciado en Vivo");
    expect(native.textContent).toContain(
      "Centro de Comandos Operativos de Sede"
    );
    expect(native.textContent).toContain("🔍 Auditar Bahías");
    expect(native.textContent).toContain("⚡ Taquilla Directa");
    expect(native.textContent).toContain("🏷️ Configurar Tarifas");

    const dockButtons = native.querySelectorAll(
      "nv-card:last-of-type nv-button"
    );
    expect(dockButtons.length).toBe(3);

    dockButtons[0].click();
    expect(mockFacade.onManageSlots).toHaveBeenCalled();

    dockButtons[1].click();
    expect(mockFacade.onManageOperations).toHaveBeenCalled();

    dockButtons[2].click();
    expect(mockFacade.onManageRates).toHaveBeenCalled();
  });

  it("should format coordinates properly with formatGps", () => {
    expect(component.formatGps({ latitude: 4.7012, longitude: -74.0321 })).toBe(
      "4.7012° N · 74.0321° W"
    );
    expect(
      component.formatGps({ latitude: -12.0464, longitude: 77.0428 })
    ).toBe("12.0464° S · 77.0428° E");
    expect(component.formatGps(undefined)).toBe("0.0000° N · 0.0000° W");
  });

  it("should compute activeParkingSubtitle with only address when active lot is present", () => {
    const subtitle = component.activeParkingSubtitle();
    expect(subtitle).toBe("Calle 100 # 15-20, Bogotá");
  });

  it("should render empty state when active parking is null", () => {
    mockActiveParkingLotSignal.set(null);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector("app-parking-empty-state")).toBeTruthy();
    expect(el.querySelector("app-parking-stats-grid")).toBeNull();
  });
});
