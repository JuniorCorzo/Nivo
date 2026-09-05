import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ParkingService } from "@core/services/parking-service";

import {
  ACTIVE_PARKING_STORAGE_KEY,
  ActiveParkingService,
} from "./active-parking.service";

describe("ActiveParkingService", () => {
  let service: ActiveParkingService;
  let mockParkingLotsSignal: ReturnType<
    typeof signal<ParkingLotListItemModel[]>
  >;

  const mockLots: ParkingLotListItemModel[] = [
    {
      address: {
        city: "Bogota",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 100",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6, longitude: -74 },
      createdAt: "2026-01-01T00:00:00Z",
      currency: "COP",
      id: "parking-1",
      name: "Parqueadero Norte",
      occuppationRate: 50,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 100,
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      address: {
        city: "Bogota",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Carrera 30",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.5, longitude: -74.1 },
      createdAt: "2026-01-01T00:00:00Z",
      currency: "COP",
      id: "parking-2",
      name: "Parqueadero Sur",
      occuppationRate: 30,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 80,
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    window.localStorage.removeItem(ACTIVE_PARKING_STORAGE_KEY);
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);

    const injector = Injector.create({
      providers: [
        {
          provide: ParkingService,
          useValue: { parkingLots: mockParkingLotsSignal },
        },
      ],
    });

    service = runInInjectionContext(injector, () => new ActiveParkingService());
  });

  afterEach(() => {
    window.localStorage.removeItem(ACTIVE_PARKING_STORAGE_KEY);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should default activeParkingLot to the first lot when no id is stored", () => {
    expect(service.activeParkingLot()).toEqual(mockLots[0]);
    expect(service.hasActiveParking()).toBe(true);
    expect(service.activeParkingName()).toBe("Parqueadero Norte");
  });

  it("should return null when there are no parking lots available", () => {
    mockParkingLotsSignal.set([]);
    expect(service.activeParkingLot()).toBeNull();
    expect(service.hasActiveParking()).toBe(false);
    expect(service.activeParkingName()).toBe("");
  });

  it("should set active parking by ID and persist to localStorage", () => {
    service.setActiveParkingId("parking-2");
    expect(service.activeParkingId()).toBe("parking-2");
    expect(service.activeParkingLot()).toEqual(mockLots[1]);
    expect(service.activeParkingName()).toBe("Parqueadero Sur");
    expect(window.localStorage.getItem(ACTIVE_PARKING_STORAGE_KEY)).toBe(
      "parking-2"
    );
  });

  it("should set active parking by model object", () => {
    service.setActiveParking(mockLots[1]);
    expect(service.activeParkingId()).toBe("parking-2");
    expect(service.activeParkingLot()).toEqual(mockLots[1]);
  });

  it("should set active parking to null when passing null to setActiveParking", () => {
    service.setActiveParking(null);
    expect(service.activeParkingId()).toBeNull();
    // Falls back to first lot if lots exist
    expect(service.activeParkingLot()).toEqual(mockLots[0]);
  });

  it("should clear active parking and remove from localStorage", () => {
    service.setActiveParkingId("parking-2");
    expect(window.localStorage.getItem(ACTIVE_PARKING_STORAGE_KEY)).toBe(
      "parking-2"
    );

    service.clearActiveParking();
    expect(service.activeParkingId()).toBeNull();
    expect(window.localStorage.getItem(ACTIVE_PARKING_STORAGE_KEY)).toBeNull();
  });

  it("should initialize with stored ID if present in localStorage", () => {
    window.localStorage.setItem(ACTIVE_PARKING_STORAGE_KEY, "parking-2");

    const injector = Injector.create({
      providers: [
        {
          provide: ParkingService,
          useValue: { parkingLots: mockParkingLotsSignal },
        },
      ],
    });

    const storedService = runInInjectionContext(
      injector,
      () => new ActiveParkingService()
    );
    expect(storedService.activeParkingId()).toBe("parking-2");
    expect(storedService.activeParkingLot()).toEqual(mockLots[1]);
  });

  it("should fallback to first lot if stored ID does not match any lot", () => {
    window.localStorage.setItem(ACTIVE_PARKING_STORAGE_KEY, "non-existent-id");

    const injector = Injector.create({
      providers: [
        {
          provide: ParkingService,
          useValue: { parkingLots: mockParkingLotsSignal },
        },
      ],
    });

    const fallbackService = runInInjectionContext(
      injector,
      () => new ActiveParkingService()
    );
    expect(fallbackService.activeParkingLot()).toEqual(mockLots[0]);
  });
});
