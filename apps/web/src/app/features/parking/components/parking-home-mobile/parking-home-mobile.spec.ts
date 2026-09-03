import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ToastService } from '@nivo-sass/design-system';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';
import { ParkingHomeMobile } from './parking-home-mobile';

describe('ParkingHomeMobile', () => {
  let component: ParkingHomeMobile;
  let mockParkingLotsSignal: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
  let mockActiveParkingLotSignal: ReturnType<typeof signal<ParkingLotListItemModel | null>>;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;
  let mockParkingService: Partial<ParkingService>;
  let mockToastService: { showToast: jasmine.Spy };

  const mockLots: ParkingLotListItemModel[] = [
    {
      id: '1',
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
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
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

    component = runInInjectionContext(injector, () => new ParkingHomeMobile());
  });

  describe('Component creation and Signals', () => {
    it('should create the component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should expose activeParkingLot computed signal', () => {
      expect(component.activeParkingLot()).toEqual(mockLots[0]);
    });

    it('should correctly compute slot distribution metrics', () => {
      expect(component.totalSlots()).toBe(50);
      expect(component.occupiedSlots()).toBe(20);
      expect(component.availableSlots()).toBe(30);
    });

    it('should return 0 when activeParkingLot is null', () => {
      mockActiveParkingLotSignal.set(null);
      expect(component.totalSlots()).toBe(0);
      expect(component.occupiedSlots()).toBe(0);
      expect(component.availableSlots()).toBe(0);
    });

    it('should format address lines and coordinates', () => {
      expect(component.addressLine()).toBe('Calle 100 # 15-20, Bogotá, Cundinamarca');
      expect(component.addressSubline()).toBe('Colombia · 110111');
      expect(component.formattedCoords()).toBe('4.6097, -74.0817');
    });

    it('should handle null parking lot for address and coordinates', () => {
      mockActiveParkingLotSignal.set(null);
      expect(component.addressLine()).toBe('');
      expect(component.addressSubline()).toBe('');
      expect(component.formattedCoords()).toBe('');
    });
  });

  describe('Helpers', () => {
    it('should format slot labels correctly', () => {
      const label = component.slotLabel({
        type: 'MOTORCYCLE',
        count: 5,
        prefix: 'M',
        zone: 'B1',
      });
      expect(label).toBe('B1 · MOTORCYCLE');
    });
  });

  describe('Router navigation', () => {
    it('should navigate to create parking page on onCreateParking', () => {
      component.onCreateParking();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
    });

    it('should navigate to edit parking page on onEdit', () => {
      component.onEdit();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.editParkingLots('1')]);
    });

    it('should navigate to manage slots page on onManageSlots', () => {
      component.onManageSlots();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotSlots('1')]);
    });

    it('should navigate to manage rates page on onManageRates', () => {
      component.onManageRates();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotRates('1')]);
    });

    it('should navigate to operations page on onManageOperations', () => {
      component.onManageOperations();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotOperations('1')]);
    });

    it('should not navigate if active parking is null', () => {
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
      expect(component.selectedParkingId()).toBe('1');
    });

    it('should not open delete modal when active lot is null', () => {
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

    it('should delete lot and show success toast on confirm', () => {
      component.onDeleteClick();
      component.onDeleteConfirm();

      expect(mockParkingService.delete).toHaveBeenCalledWith('1');
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
