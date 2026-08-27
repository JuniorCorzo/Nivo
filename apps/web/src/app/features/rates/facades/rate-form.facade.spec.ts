import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ToastService } from '@nivo-sass/design-system';

import { RateFormFacade } from './rate-form.facade';
import { RateService } from '@core/services/rate-service';
import { ParkingService } from '@core/services/parking-service';

describe('RateFormFacade', () => {
  let facade: RateFormFacade;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    rateServiceSpy = jasmine.createSpyObj('RateService', [
      'getRatesByParkingId',
      'loadSpecialPolicies',
      'createRate',
      'updateRate',
      'deleteRate',
      'simulateCalculation',
    ], {
      ratesByParking: () => ({ 'parking-1': [] }),
      specialPolicies: () => [],
    });

    rateServiceSpy.getRatesByParkingId.and.returnValue(of([]));
    rateServiceSpy.loadSpecialPolicies.and.returnValue(of([]));
    rateServiceSpy.simulateCalculation.and.returnValue({
      basePrice: 5000,
      timeUnit: 'HOURS',
      durationInMinutes: 120,
      unitsCalculated: 2,
      subtotal: 10000,
      discountOrSurcharge: 0,
      total: 10000,
    });

    parkingServiceSpy = jasmine.createSpyObj('ParkingService', [], {
      parkingLots: () => [{ id: 'parking-1', name: 'Centro' } as any],
    });

    toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RateFormFacade,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ parkingId: 'parking-1' })),
          },
        },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    facade = TestBed.inject(RateFormFacade);
  });

  it('should initialize in create mode', () => {
    expect(facade.mode()).toBe('create');
    expect(facade.parkingId()).toBe('parking-1');
  });

  it('should validate form correctly', () => {
    facade.form.name.set('Tarifa Carro');
    facade.form.description.set('Tarifa por hora');
    facade.form.pricePerUnit.set(3000);
    facade.form.minChargeTimeMinutes.set(10);
    expect(facade.isValid()).toBe(true);

    facade.form.description.set('');
    expect(facade.isValid()).toBe(false);

    facade.form.description.set('Tarifa por hora');
    facade.form.pricePerUnit.set(0);
    expect(facade.isValid()).toBe(false);
  });

  it('should calculate live simulation correctly via computed signal', () => {
    const sim = facade.simulation();
    expect(sim.total).toBe(10000);
  });
});
