import "@angular/compiler";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";

import { ParkingHomeFacade } from "../../facades/parking-home.facade";
import { ParkingHomeMobile } from "./parking-home-mobile";

describe("ParkingHomeMobile Component", () => {
  let component: ParkingHomeMobile;
  let fixture: ComponentFixture<ParkingHomeMobile>;
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
      imports: [ParkingHomeMobile],
      providers: [
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
          },
        },
      ],
    })
      .overrideComponent(ParkingHomeMobile, {
        set: {
          providers: [{ provide: ParkingHomeFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ParkingHomeMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should render subcomponents in mobile view when active parking is present", () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector("app-parking-stats-grid")).toBeTruthy();
    expect(el.querySelector("app-parking-general-info")).toBeTruthy();
    expect(el.querySelector("app-parking-empty-state")).toBeNull();
  });

  it("should render empty state when active parking is null", () => {
    mockActiveParkingLotSignal.set(null);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector("app-parking-empty-state")).toBeTruthy();
    expect(el.querySelector("app-parking-stats-grid")).toBeNull();
  });
});
