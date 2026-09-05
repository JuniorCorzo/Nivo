import "@angular/compiler";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { ParkingLotSelector } from "./parking-lot-selector";

interface MockRouter {
  navigate: ReturnType<typeof vi.fn>;
}

describe("ParkingLotSelector", () => {
  let component: ParkingLotSelector;
  let fixture: ComponentFixture<ParkingLotSelector>;
  let mockParkingLotsSignal: ReturnType<
    typeof signal<ParkingLotListItemModel[]>
  >;
  let mockActiveParkingLotSignal: ReturnType<
    typeof signal<ParkingLotListItemModel | null>
  >;
  let setActiveParkingSpy: ReturnType<typeof vi.fn>;
  let mockRouter: MockRouter;

  const mockLots: ParkingLotListItemModel[] = [
    {
      address: {
        city: "Bogotá",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 100 # 15-20",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6097, longitude: -74.0817 },
      createdAt: "2026-01-01T00:00:00Z",
      currency: "COP",
      id: "lot-1",
      name: "Sede Principal",
      occuppationRate: 40,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 50,
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      address: {
        city: "Bogotá",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Carrera 7 # 120-10",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.7097, longitude: -74.0317 },
      createdAt: "2026-01-01T00:00:00Z",
      currency: "COP",
      id: "lot-2",
      name: "Sede Norte",
      occuppationRate: 80,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 100,
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ];

  beforeEach(async () => {
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(
      mockLots[0]
    );
    setActiveParkingSpy = vi.fn();
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ParkingLotSelector],
      providers: [
        {
          provide: ParkingService,
          useValue: { parkingLots: mockParkingLotsSignal },
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingLot: mockActiveParkingLotSignal,
            setActiveParking: setActiveParkingSpy,
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingLotSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should compute activeLot from ActiveParkingService", () => {
    expect(component.activeLot()).toEqual(mockLots[0]);
  });

  it("should compute parkingLots list from ParkingService", () => {
    expect(component.parkingLots()).toEqual(mockLots);
  });

  it("should toggle dropdown open and closed on toggleOpen()", () => {
    expect(component.isOpen()).toBe(false);

    component.toggleOpen();
    expect(component.isOpen()).toBe(true);

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it("should not toggle open when disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it("should close dropdown on close()", () => {
    component.isOpen.set(true);
    component.close();
    expect(component.isOpen()).toBe(false);
  });

  it("should select a parking lot, update ActiveParkingService, emit event, and close", () => {
    let emittedLot: ParkingLotListItemModel | undefined;
    component.parkingChange.subscribe((lot: ParkingLotListItemModel) => {
      emittedLot = lot;
    });

    component.isOpen.set(true);
    component.selectParkingLot(mockLots[1]);

    expect(setActiveParkingSpy).toHaveBeenCalledWith(mockLots[1]);
    expect(emittedLot).toEqual(mockLots[1]);
    expect(component.isOpen()).toBe(false);
  });

  it("should correctly determine isSelected", () => {
    expect(component.isSelected(mockLots[0])).toBe(true);
    expect(component.isSelected(mockLots[1])).toBe(false);
  });

  it("should format address properly", () => {
    expect(component.getFormattedAddress(mockLots[0])).toBe(
      "Calle 100 # 15-20, Bogotá"
    );
  });

  it("should compute activeAddress based on activeLot", () => {
    expect(component.activeAddress()).toBe("Calle 100 # 15-20, Bogotá");
    mockActiveParkingLotSignal.set(null);
    expect(component.activeAddress()).toBe("");
  });

  it("should compute hasMultipleLots based on parkingLots length", () => {
    expect(component.hasMultipleLots()).toBe(true);
    mockParkingLotsSignal.set([mockLots[0]]);
    expect(component.hasMultipleLots()).toBe(false);
  });

  it("should not toggle open when variant is title and hasMultipleLots is false", () => {
    fixture.componentRef.setInput("variant", "title");
    mockParkingLotsSignal.set([mockLots[0]]);
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it("should toggle open when variant is title and hasMultipleLots is true", () => {
    fixture.componentRef.setInput("variant", "title");
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.isOpen()).toBe(true);
  });

  it("should navigate to create parking page and close dropdown on onCreateParking()", () => {
    component.isOpen.set(true);
    component.onCreateParking();

    expect(component.isOpen()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      APP_ROUTES.app.createParkingLots,
    ]);
  });
});
