import "@angular/compiler";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import type { ParkingTelemetryModel } from "@core/models/parking-telemetry.model";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { of, throwError } from "rxjs";

import { ParkingHomeFacade } from "./parking-home.facade";

interface MockParkingService {
  delete: ReturnType<typeof vi.fn>;
  getTelemetry: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("ParkingHomeFacade", () => {
  let facade: ParkingHomeFacade;
  let mockActiveParkingLotSignal: ReturnType<
    typeof signal<ParkingLotListItemModel | null>
  >;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;
  let mockParkingService: MockParkingService;
  let mockToastService: MockToastService;

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
      createdAt: "2026-01-01T10:30:00Z",
      currency: "COP",
      id: "lot-1",
      name: "Parqueadero Central",
      occuppationRate: 40,
      ownerName: "Owner 1",
      slotDistribution: [
        { count: 30, prefix: "A", type: "CAR", zone: "Norte" },
        { count: 20, prefix: "M", type: "MOTORCYCLE", zone: "Sur" },
      ],
      totalCapacity: 50,
      updatedAt: "2026-01-02T15:45:00Z",
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
      currency: "USD",
      id: "lot-2",
      name: "Estacionamiento Norte",
      occuppationRate: 80,
      ownerName: "Owner 2",
      slotDistribution: [
        { count: 100, prefix: "B", type: "CAR", zone: "General" },
      ],
      totalCapacity: 100,
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    navigatedCommands = null;
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(
      mockLots[0]
    );
    mockRouter = {
      navigate: (commands: unknown[]) => {
        navigatedCommands = commands;
        return Promise.resolve(true);
      },
    };
    mockParkingService = {
      delete: vi.fn().mockReturnValue(of(null)),
      getTelemetry: vi.fn().mockReturnValue(of(null)),
    };
    mockToastService = {
      showToast: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ParkingHomeFacade,
        {
          provide: ParkingService,
          useValue: mockParkingService,
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingLot: mockActiveParkingLotSignal,
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
    });

    facade = TestBed.inject(ParkingHomeFacade);
  });

  describe("Initialization and Computed Signals", () => {
    it("should create facade instance", () => {
      expect(facade).toBeTruthy();
    });

    it("should expose activeParkingLot computed signal", () => {
      expect(facade.activeParkingLot()).toEqual(mockLots[0]);
      mockActiveParkingLotSignal.set(mockLots[1]);
      expect(facade.activeParkingLot()).toEqual(mockLots[1]);
    });

    it("should correctly compute slot metrics for active parking", () => {
      expect(facade.totalSlots()).toBe(50);
      expect(facade.occupiedSlots()).toBe(20);
      expect(facade.availableSlots()).toBe(30);
      expect(facade.occupationRate()).toBe(40);
      expect(facade.occupiedSlotsDetail()).toEqual([]);
    });

    it("should return 0 for metrics when activeParkingLot is null", () => {
      mockActiveParkingLotSignal.set(null);
      expect(facade.totalSlots()).toBe(0);
      expect(facade.occupiedSlots()).toBe(0);
      expect(facade.availableSlots()).toBe(0);
      expect(facade.occupationRate()).toBe(0);
      expect(facade.occupiedSlotsDetail()).toEqual([]);
    });

    it("should call parkingService.getTelemetry when activeParkingLot changes", () => {
      TestBed.flushEffects();
      expect(mockParkingService.getTelemetry).toHaveBeenCalledWith("lot-1");

      mockActiveParkingLotSignal.set(mockLots[1]);
      TestBed.flushEffects();
      expect(mockParkingService.getTelemetry).toHaveBeenCalledWith("lot-2");
    });

    it("should prioritize telemetry data when telemetry is loaded", () => {
      const mockTelemetry: ParkingTelemetryModel = {
        availableSlots: 45,
        carOccupied: 25,
        carRate: 50,
        carTotal: 50,
        motoOccupied: 10,
        motoRate: 33.3,
        motoTotal: 30,
        occupancyRate: 43.75,
        occupiedSlots: 35,
        occupiedSlotsDetail: [
          {
            licensePlate: "XYZ789",
            prefix: "A",
            slotNumber: "01",
            type: "CAR",
            zone: "Norte",
          },
        ],
        parkingId: "lot-1",
        totalCapacity: 80,
      };

      facade.telemetry.set(mockTelemetry);

      expect(facade.totalSlots()).toBe(80);
      expect(facade.occupiedSlots()).toBe(35);
      expect(facade.availableSlots()).toBe(45);
      expect(facade.occupationRate()).toBe(43.75);
      expect(facade.occupiedSlotsDetail()).toEqual(
        mockTelemetry.occupiedSlotsDetail
      );
    });

    it("should handle error in loadTelemetry gracefully by clearing telemetry to null", () => {
      mockParkingService.getTelemetry.mockReturnValue(
        throwError(() => new Error("Network error"))
      );
      facade.loadTelemetry("lot-1");
      expect(facade.telemetry()).toBeNull();
      expect(facade.totalSlots()).toBe(50);
    });
  });

  describe("Navigation", () => {
    it("should navigate to create parking page on onCreateParking", () => {
      facade.onCreateParking();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
    });

    it("should navigate to edit parking page on onEdit", () => {
      facade.onEdit();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.editParkingLots("lot-1"),
      ]);
    });

    it("should navigate to slots management page on onManageSlots", () => {
      facade.onManageSlots();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotSlots("lot-1"),
      ]);
    });

    it("should navigate to rates management page on onManageRates", () => {
      facade.onManageRates();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotRates("lot-1"),
      ]);
    });

    it("should navigate to active parking operations on onManageOperations", () => {
      facade.onManageOperations();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotOperations("lot-1"),
      ]);
    });

    it("should navigate to active parking tickets on onManageTickets", () => {
      facade.onManageTickets();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotTickets("lot-1"),
      ]);
    });

    it("should not navigate on actions if activeParkingLot is null", () => {
      mockActiveParkingLotSignal.set(null);
      facade.onEdit();
      facade.onManageSlots();
      facade.onManageRates();
      facade.onManageOperations();
      facade.onManageTickets();
      expect(navigatedCommands).toBeNull();
    });
  });

  describe("Delete Modal", () => {
    it("should open delete modal on onDeleteClick", () => {
      facade.onDeleteClick();
      expect(facade.isDeleteModalOpen()).toBe(true);
      expect(facade.selectedParkingId()).toBe("lot-1");
    });

    it("should not open delete modal if active parking is null", () => {
      mockActiveParkingLotSignal.set(null);
      facade.onDeleteClick();
      expect(facade.isDeleteModalOpen()).toBe(false);
    });

    it("should close delete modal on onDeleteCancel", () => {
      facade.onDeleteClick();
      facade.onDeleteCancel();
      expect(facade.isDeleteModalOpen()).toBe(false);
      expect(facade.selectedParkingId()).toBeNull();
    });

    it("should call parkingService.delete and show toast on confirm delete", () => {
      facade.onDeleteClick();
      facade.onDeleteConfirm();

      expect(mockParkingService.delete).toHaveBeenCalledWith("lot-1");
      expect(mockToastService.showToast).toHaveBeenCalledWith({
        message: APP_TEXTS.parking.messages.deleted,
        type: "success",
      });
      expect(facade.isDeleteModalOpen()).toBe(false);
    });

    it("should handle delete error and show error toast", () => {
      mockParkingService.delete.mockReturnValue(
        throwError(() => new Error("Error"))
      );
      facade.onDeleteClick();
      facade.onDeleteConfirm();

      expect(mockToastService.showToast).toHaveBeenCalledWith({
        message: APP_TEXTS.parking.messages.errors.notFound,
        type: "error",
      });
      expect(facade.isDeleteModalOpen()).toBe(false);
    });
  });
});
