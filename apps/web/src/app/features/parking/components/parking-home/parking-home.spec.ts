import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { of, throwError } from "rxjs";

import { ParkingHome } from "./parking-home";

describe("ParkingHome", () => {
  let component: ParkingHome;
  let mockParkingLotsSignal: ReturnType<
    typeof signal<ParkingLotListItemModel[]>
  >;
  let mockActiveParkingLotSignal: ReturnType<
    typeof signal<ParkingLotListItemModel | null>
  >;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;
  let mockParkingService: Partial<ParkingService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

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
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);
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
      delete: jasmine.createSpy("delete").and.returnValue(of()),
      parkingLots: mockParkingLotsSignal,
    };
    mockToastService = jasmine.createSpyObj<ToastService>("ToastService", [
      "showToast",
    ]);

    const injector = Injector.create({
      providers: [
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

    component = runInInjectionContext(injector, () => new ParkingHome());
  });

  describe("Initialization and Computed Signals", () => {
    it("should create the component instance", () => {
      expect(component).toBeTruthy();
    });

    it("should expose activeParkingLot computed signal", () => {
      expect(component.activeParkingLot()).toEqual(mockLots[0]);
      mockActiveParkingLotSignal.set(mockLots[1]);
      expect(component.activeParkingLot()).toEqual(mockLots[1]);
    });

    it("should correctly compute slot metrics for active parking", () => {
      expect(component.totalSlots()).toBe(50);
      // 50 * 40%
      expect(component.occupiedSlots()).toBe(20);
      // 50 - 20
      expect(component.availableSlots()).toBe(30);
    });

    it("should return 0 for metrics when activeParkingLot is null", () => {
      mockActiveParkingLotSignal.set(null);
      expect(component.totalSlots()).toBe(0);
      expect(component.occupiedSlots()).toBe(0);
      expect(component.availableSlots()).toBe(0);
    });
  });

  describe("Navigation", () => {
    it("should navigate to create parking page on onCreateParking", () => {
      component.onCreateParking();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
    });

    it("should navigate to edit parking page on onEdit", () => {
      component.onEdit();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.editParkingLots("lot-1"),
      ]);
    });

    it("should navigate to slots management page on onManageSlots", () => {
      component.onManageSlots();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotSlots("lot-1"),
      ]);
    });

    it("should navigate to rates management page on onManageRates", () => {
      component.onManageRates();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotRates("lot-1"),
      ]);
    });

    it("should navigate to active parking operations on onManageOperations", () => {
      component.onManageOperations();
      expect(navigatedCommands).toEqual([
        APP_ROUTES.app.parkingLotOperations("lot-1"),
      ]);
    });

    it("should not navigate on actions if activeParkingLot is null", () => {
      mockActiveParkingLotSignal.set(null);
      component.onEdit();
      component.onManageSlots();
      component.onManageRates();
      component.onManageOperations();
      expect(navigatedCommands).toBeNull();
    });
  });

  describe("Delete Modal", () => {
    it("should open delete modal on onDeleteClick", () => {
      component.onDeleteClick();
      expect(component.isDeleteModalOpen()).toBeTrue();
      expect(component.selectedParkingId()).toBe("lot-1");
    });

    it("should not open delete modal if active parking is null", () => {
      mockActiveParkingLotSignal.set(null);
      component.onDeleteClick();
      expect(component.isDeleteModalOpen()).toBeFalse();
    });

    it("should close delete modal on onDeleteCancel", () => {
      component.onDeleteClick();
      component.onDeleteCancel();
      expect(component.isDeleteModalOpen()).toBeFalse();
      expect(component.selectedParkingId()).toBeNull();
    });

    it("should call parkingService.delete and show toast on confirm delete", () => {
      component.onDeleteClick();
      component.onDeleteConfirm();

      expect(mockParkingService.delete).toHaveBeenCalledWith("lot-1");
      expect(mockToastService.showToast).toHaveBeenCalledWith({
        message: APP_TEXTS.parking.messages.deleted,
        type: "success",
      });
      expect(component.isDeleteModalOpen()).toBeFalse();
    });

    it("should handle delete error and show error toast", () => {
      /* SAFETY: delete spy is configured as jasmine.Spy */
      (mockParkingService.delete as jasmine.Spy).and.returnValue(
        throwError(() => new Error("Error"))
      );
      component.onDeleteClick();
      component.onDeleteConfirm();

      expect(mockToastService.showToast).toHaveBeenCalledWith({
        message: APP_TEXTS.parking.messages.errors.notFound,
        type: "error",
      });
      expect(component.isDeleteModalOpen()).toBeFalse();
    });
  });

  describe("DOM Integration", () => {
    let fixture: ComponentFixture<ParkingHome>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ParkingHome],
        providers: [
          { provide: ParkingService, useValue: mockParkingService },
          {
            provide: ActiveParkingService,
            useValue: { activeParkingLot: mockActiveParkingLotSignal },
          },
          { provide: Router, useValue: mockRouter },
          { provide: ToastService, useValue: mockToastService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ParkingHome);
      fixture.detectChanges();
    });

    it("should render sub-components when activeParkingLot is present", () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector("app-parking-stats-grid")).toBeTruthy();
      expect(el.querySelector("app-parking-general-info")).toBeTruthy();
      expect(el.querySelector("app-parking-slot-distribution")).toBeTruthy();
      expect(el.querySelector("app-parking-map")).toBeTruthy();
      expect(el.querySelector("app-parking-empty-state")).toBeNull();
    });

    it("should render empty state when activeParkingLot is null", () => {
      mockActiveParkingLotSignal.set(null);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector("app-parking-empty-state")).toBeTruthy();
      expect(el.querySelector("app-parking-stats-grid")).toBeNull();
    });
  });
});
