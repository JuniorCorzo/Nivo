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
    expect(header.textContent).toContain("Operaciones en vivo");
    expect(header.textContent).toContain("Calle 100 # 15-20, Bogotá");
    expect(header.textContent).not.toContain("Parqueadero Central — Calle 100");
    const breadcrumb = header.querySelector(
      '[data-testid="page-header-breadcrumb"]'
    );
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.textContent).toContain("Home");
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
