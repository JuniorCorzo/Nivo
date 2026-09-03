import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { ParkingHomeMobile } from './parking-home-mobile';

describe('ParkingHomeMobile', () => {
  let component: ParkingHomeMobile;
  let mockParkingLotsSignal: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
  let mockActiveParkingLotSignal: ReturnType<typeof signal<ParkingLotListItemModel | null>>;
  let setActiveParkingSpy: jasmine.Spy;
  let setActiveParkingIdSpy: jasmine.Spy;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;

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
      slotDistribution: [],
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
      slotDistribution: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    navigatedCommands = null;
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(mockLots[0]);
    setActiveParkingSpy = jasmine.createSpy('setActiveParking');
    setActiveParkingIdSpy = jasmine.createSpy('setActiveParkingId');

    mockRouter = {
      navigate: (commands: unknown[]) => {
        navigatedCommands = commands;
        return Promise.resolve(true);
      },
    };

    const injector = Injector.create({
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
            setActiveParkingId: setActiveParkingIdSpy,
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    });

    component = runInInjectionContext(injector, () => new ParkingHomeMobile());
  });

  describe('Component creation', () => {
    it('should create the component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should expose activeParkingLot computed signal', () => {
      expect(component.activeParkingLot()).toEqual(mockLots[0]);
    });
  });

  describe('Search signal filtering', () => {
    it('should return all parking lots when search query is empty', () => {
      const lots = (component as unknown as { parkingLots: () => ParkingLotListItemModel[] }).parkingLots();
      expect(lots.length).toBe(2);
      expect(lots).toEqual(mockLots);
    });

    it('should filter parking lots matching search query', () => {
      (component as unknown as { onSearchInput: (e: Event) => void }).onSearchInput({
        target: { value: 'Central' },
      } as unknown as Event);

      const filtered = (component as unknown as { parkingLots: () => ParkingLotListItemModel[] }).parkingLots();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Parqueadero Central');
    });

    it('should filter case-insensitively and handle whitespace', () => {
      (component as unknown as { onSearchInput: (e: Event) => void }).onSearchInput({
        target: { value: '  norte  ' },
      } as unknown as Event);

      const filtered = (component as unknown as { parkingLots: () => ParkingLotListItemModel[] }).parkingLots();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Estacionamiento Norte');
    });

    it('should return empty list when search query does not match', () => {
      (component as unknown as { onSearchInput: (e: Event) => void }).onSearchInput({
        target: { value: 'non-existent' },
      } as unknown as Event);

      const filtered = (component as unknown as { parkingLots: () => ParkingLotListItemModel[] }).parkingLots();
      expect(filtered.length).toBe(0);
    });
  });

  describe('Router navigation and active parking', () => {
    it('should navigate to create parking page on onCreateParking', () => {
      (component as unknown as { onCreateParking: () => void }).onCreateParking();
      expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
    });

    it('should navigate to edit parking page on onEditParking', () => {
      (component as unknown as { onEditParking: (id: string) => void }).onEditParking('lot-123');
      expect(navigatedCommands).toEqual([APP_ROUTES.app.editParkingLots('lot-123')]);
    });

    it('should navigate to view parking details page on onViewParking', () => {
      (component as unknown as { onViewParking: (id: string) => void }).onViewParking('lot-123');
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLots, 'lot-123']);
    });

    it('should update active parking ID and navigate to operations page on onManageOperations', () => {
      (component as unknown as { onManageOperations: (id: string) => void }).onManageOperations('lot-123');
      expect(setActiveParkingIdSpy).toHaveBeenCalledWith('lot-123');
      expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotOperations('lot-123')]);
    });

    it('should set active parking lot on onSelectActive', () => {
      (component as unknown as { onSelectActive: (lot: ParkingLotListItemModel) => void }).onSelectActive(mockLots[1]);
      expect(setActiveParkingSpy).toHaveBeenCalledWith(mockLots[1]);
    });

    it('should correctly check isActive status', () => {
      const comp = component as unknown as { isActive: (lot: ParkingLotListItemModel) => boolean };
      expect(comp.isActive(mockLots[0])).toBeTrue();
      expect(comp.isActive(mockLots[1])).toBeFalse();
    });
  });

  describe('Helper methods', () => {
    it('should format address correctly joining street and city', () => {
      const comp = component as unknown as { getAddress: (lot: ParkingLotListItemModel) => string };
      const formatted = comp.getAddress(mockLots[0]);
      expect(formatted).toBe('Calle 100 # 15-20, Bogotá');
    });

    it('should handle partial address', () => {
      const comp = component as unknown as { getAddress: (lot: ParkingLotListItemModel) => string };
      const partialLot: ParkingLotListItemModel = {
        ...mockLots[0],
        address: { street: 'Calle 100', city: '', state: '', country: '', zipCode: '' },
      };
      expect(comp.getAddress(partialLot)).toBe('Calle 100');
    });

    it('should convert number to string with toString', () => {
      const comp = component as unknown as { toString: (val: number) => string };
      expect(comp.toString(42)).toBe('42');
      expect(comp.toString(0)).toBe('0');
    });
  });
});
