import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { ParkingHome } from './parking-home';

describe('ParkingHome', () => {
  let component: ParkingHome;
  let mockParkingLotsSignal: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
  let mockActiveParkingLotSignal: ReturnType<typeof signal<ParkingLotListItemModel | null>>;
  let navigatedCommands: unknown[] | null = null;
  let mockRouter: Partial<Router>;

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
      slotDistribution: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
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
      slotDistribution: [],
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
          },
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    });

    component = runInInjectionContext(injector, () => new ParkingHome());
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should update searchQuery signal on search input', () => {
    (component as unknown as { onSearchInput: (e: Event) => void }).onSearchInput({
      target: { value: 'test query' },
    } as unknown as Event);

    const query = (component as unknown as { searchQuery: () => string }).searchQuery();
    expect(query).toBe('test query');
  });

  it('should navigate to create parking page on onCreateParking', () => {
    (component as unknown as { onCreateParking: () => void }).onCreateParking();
    expect(navigatedCommands).toEqual([APP_ROUTES.app.createParkingLots]);
  });

  it('should navigate to active parking operations on onManageActiveOperations', () => {
    (component as unknown as { onManageActiveOperations: () => void }).onManageActiveOperations();
    expect(navigatedCommands).toEqual([APP_ROUTES.app.parkingLotOperations('lot-1')]);
  });

  it('should not navigate to operations if activeParkingLot is null', () => {
    mockActiveParkingLotSignal.set(null);
    (component as unknown as { onManageActiveOperations: () => void }).onManageActiveOperations();
    expect(navigatedCommands).toBeNull();
  });

  it('should expose activeParkingLot computed signal', () => {
    expect(component.activeParkingLot()).toEqual(mockLots[0]);
    mockActiveParkingLotSignal.set(mockLots[1]);
    expect(component.activeParkingLot()).toEqual(mockLots[1]);
  });
});
