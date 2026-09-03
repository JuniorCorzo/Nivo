import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { ParkingLotListItemModel } from '@core/models/parking.model';
import { ParkingService } from '@core/services/parking-service';
import { ActiveParkingService } from '@core/services/active-parking.service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';
import { ParkingLotSelector } from './parking-lot-selector';

describe('ParkingLotSelector', () => {
  let component: ParkingLotSelector;
  let fixture: ComponentFixture<ParkingLotSelector>;
  let mockParkingLotsSignal: ReturnType<typeof signal<ParkingLotListItemModel[]>>;
  let mockActiveParkingLotSignal: ReturnType<typeof signal<ParkingLotListItemModel | null>>;
  let setActiveParkingSpy: jasmine.Spy;
  let mockRouter: { navigate: jasmine.Spy };

  const mockLots: ParkingLotListItemModel[] = [
    {
      id: 'lot-1',
      name: 'Sede Principal',
      ownerName: 'Admin',
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
      name: 'Sede Norte',
      ownerName: 'Admin',
      address: {
        street: 'Carrera 7 # 120-10',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        zipCode: '110111',
      },
      coordinates: { latitude: 4.7097, longitude: -74.0317 },
      currency: 'COP',
      totalCapacity: 100,
      occuppationRate: 80,
      slotDistribution: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockParkingLotsSignal = signal<ParkingLotListItemModel[]>(mockLots);
    mockActiveParkingLotSignal = signal<ParkingLotListItemModel | null>(mockLots[0]);
    setActiveParkingSpy = jasmine.createSpy('setActiveParking');
    mockRouter = { navigate: jasmine.createSpy('navigate') };

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

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute activeLot from ActiveParkingService', () => {
    expect(component.activeLot()).toEqual(mockLots[0]);
  });

  it('should compute parkingLots list from ParkingService', () => {
    expect(component.parkingLots()).toEqual(mockLots);
  });

  it('should toggle dropdown open and closed on toggleOpen()', () => {
    expect(component.isOpen()).toBeFalse();

    component.toggleOpen();
    expect(component.isOpen()).toBeTrue();

    component.toggleOpen();
    expect(component.isOpen()).toBeFalse();
  });

  it('should not toggle open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.isOpen()).toBeFalse();
  });

  it('should close dropdown on close()', () => {
    component.isOpen.set(true);
    component.close();
    expect(component.isOpen()).toBeFalse();
  });

  it('should select a parking lot, update ActiveParkingService, emit event, and close', () => {
    let emittedLot: ParkingLotListItemModel | undefined;
    component.parkingChange.subscribe((lot: ParkingLotListItemModel) => {
      emittedLot = lot;
    });

    component.isOpen.set(true);
    component.selectParkingLot(mockLots[1]);

    expect(setActiveParkingSpy).toHaveBeenCalledWith(mockLots[1]);
    expect(emittedLot as unknown).toEqual(mockLots[1]);
    expect(component.isOpen()).toBeFalse();
  });

  it('should correctly determine isSelected', () => {
    expect(component.isSelected(mockLots[0])).toBeTrue();
    expect(component.isSelected(mockLots[1])).toBeFalse();
  });

  it('should format address properly', () => {
    expect(component.getFormattedAddress(mockLots[0])).toBe('Calle 100 # 15-20, Bogotá');
  });

  it('should navigate to create parking page and close dropdown on onCreateParking()', () => {
    component.isOpen.set(true);
    component.onCreateParking();

    expect(component.isOpen()).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith([APP_ROUTES.app.createParkingLots]);
  });
});
