import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { ToastService } from '@nivo-sass/design-system';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ParkingHome } from './parking-home';

describe('ParkingHome', () => {
  let component: ParkingHome;
  let mockParkingLotsSignal: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
  let mockActiveParkingLotSignal: ReturnType<typeof signal<ParkingLotListItemModel | null>>;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;
  let mockParkingService: Partial<ParkingService>;
  let mockToastService: { showToast: jasmine.Spy };

  const mockLots: ParkingLotListItemModel[] = [
    {
      id: 'lot-1',
      name: 'Parqueadero Central',
      ownerName: 'Owner 1',
      address: {
        street: 'Calle 100 # 15-20',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        zipCode: '110111',
      },
      coordinates: { latitude: 4.6097, longitude: -74.0817 },
      currency: 'COP',
      totalCapacity: 50,
      occuppationRate: 40,
      slotDistribution: [
        { type: 'CAR', count: 30, prefix: 'A', zone: 'Norte' },
        { type: 'MOTORCYCLE', count: 20, prefix: 'M', zone: 'Sur' },
      ],
      createdAt: '2026-01-01T10:30:00Z',
      updatedAt: '2026-01-02T15:45:00Z',
    },
    {
      id: 'lot-2',
      name: 'Estacionamiento Norte',
      ownerName: 'Owner 2',
      address: {
        street: 'Carrera 7 # 120-10',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        zipCode: '110111',
      },
      coordinates: { latitude: 4.7097, longitude: -74.0317 },
      currency: 'USD',
      totalCapacity: 100,
      occuppationRate: 80,
      slotDistribution: [{ type: 'CAR', count: 100, prefix: 'B', zone: 'General' }],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    navigatedCommands = null;
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(mockLots[0]);
    mockRouter = {
      navigate: (commands: unknown[]) => {
        navigatedCommands = commands;
        return Promise.resolve(true);
      },
    };
    mockParkingService = {
      parkingLots: mockParkingLotsSignal,
      delete: jasmine.createSpy('delete').and.returnValue(of(undefined)),
    };
    mockToastService = {
      showToast: jasmine.createSpy('showToast'),
    };

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

  describe('Initialization and Computed Signals', () => {
    it('should create the component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should expose activeParkingLot computed signal', () => {
      expect(component.activeParkingLot()).toEqual(mockLots[0]);
      mockActiveParkingLotSignal.set(mockLots[1]);
      expect(component.activeParkingLot()).toEqual(mockLots[1]);
    });

    it('should correctly compute slot metrics for active parking', () => {
      expect(component.totalSlots()).toBe(50);
      expect(component.occupiedSlots()).toBe(20); // 50 * 40%
      expect(component.availableSlots()).toBe(30); // 50 - 20
    });

    it('should return 0 for metrics when activeParkingLot is null', () => {
      mockActiveParkingLotSignal.set(null);
      expect(component.totalSlots()).toBe(0);
      expect(component.occupiedSlots()).toBe(0);
      expect(component.availableSlots()).toBe(0);
    });

    it('should correctly format address lines and coordinates', () => {
      expect(component.addressLine()).toBe('Calle 100 # 15-20, Bogotá, Cundinamarca');
      expect(component.addressSubline()).toBe('Colombia · 110111');
      expect(component.formattedCoords()).toBe('4.6097, -74.0817');
    });

    it('should return empty address when activeParkingLot is null', () => {
      mockActiveParkingLotSignal.set(null);
      expect(component.addressLine()).toBe('');
      expect(component.addressSubline()).toBe('');
      expect(component.formattedCoords()).toBe('');
    });
  });

  describe('Helpers', () => {
    it('should format slot label correctly', () => {
      const label = component.slotLabel({
        type: 'CAR',
        count: 10,
        prefix: 'A',
        zone: 'VIP',
      });
      expect(label).toBe('VIP · CAR');
    });

    it('should format date correctly', () => {
      const formatted = component.formattedDate('2026-01-01T10:30:00Z');
      expect(formatted).toContain('2026');
    });

    it('should return empty string for empty date', () => {
      expect(component.formattedDate('')).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to create parking page on onCreateParking', () => {
      component.onCreateParking();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
    });

    it('should navigate to edit parking page on onEdit', () => {
      component.onEdit();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.editParkingLots('lot-1')]);
    });

    it('should navigate to slots management page on onManageSlots', () => {
      component.onManageSlots();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotSlots('lot-1')]);
    });

    it('should navigate to rates management page on onManageRates', () => {
      component.onManageRates();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotRates('lot-1')]);
    });

    it('should navigate to active parking operations on onManageOperations', () => {
      component.onManageOperations();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotOperations('lot-1')]);
    });

    it('should not navigate on actions if activeParkingLot is null', () => {
      mockActiveParkingLotSignal.set(null);
      component.onEdit();
      component.onManageSlots();
      component.onManageRates();
      component.onManageOperations();
      expect(navigatedCommands).toBeNull();
    });
  });

  describe('Delete Modal', () => {
    it('should open delete modal on onDeleteClick', () => {
      component.onDeleteClick();
      expect(component.isDeleteModalOpen()).toBeTrue();
      expect(component.selectedParkingId()).toBe('lot-1');
    });

    it('should not open delete modal if active parking is null', () => {
      mockActiveParkingLotSignal.set(null);
      component.onDeleteClick();
      expect(component.isDeleteModalOpen()).toBeFalse();
    });

    it('should close delete modal on onDeleteCancel', () => {
      component.onDeleteClick();
      component.onDeleteCancel();
      expect(component.isDeleteModalOpen()).toBeFalse();
      expect(component.selectedParkingId()).toBeNull();
    });

    it('should call parkingService.delete and show toast on confirm delete', () => {
      component.onDeleteClick();
      component.onDeleteConfirm();

      expect(mockParkingService.delete).toHaveBeenCalledWith('lot-1');
      expect(mockToastService.showToast).toHaveBeenCalledWith({
        type: 'success',
        message: APP_TEXTS.parking.messages.deleted,
      });
      expect(component.isDeleteModalOpen()).toBeFalse();
    });

    it('should handle delete error and show error toast', () => {
      (mockParkingService.delete as jasmine.Spy).and.returnValue(
        throwError(() => new Error('Error')),
      );
      component.onDeleteClick();
      component.onDeleteConfirm();

      expect(mockToastService.showToast).toHaveBeenCalledWith({
        type: 'error',
        message: APP_TEXTS.parking.messages.errors.notFound,
      });
      expect(component.isDeleteModalOpen()).toBeFalse();
    });
  });
});
