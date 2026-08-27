import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RateService } from './rate-service';
import { ParkingLotsService, RatesService, TenantsService } from '@core/api/generated/services';
import { SpecialPolicyModel } from '@core/models/rate.model';

describe('RateService', () => {
  let service: RateService;
  let parkingLotsServiceSpy: jasmine.SpyObj<ParkingLotsService>;
  let ratesServiceSpy: jasmine.SpyObj<RatesService>;
  let tenantsServiceSpy: jasmine.SpyObj<TenantsService>;

  beforeEach(() => {
    parkingLotsServiceSpy = jasmine.createSpyObj('ParkingLotsService', [
      'showRatesByParkingId',
      'createRateForParking',
    ]);
    ratesServiceSpy = jasmine.createSpyObj('RatesService', [
      'updateRate',
      'deleteRate',
      'calculatePrice',
    ]);
    tenantsServiceSpy = jasmine.createSpyObj('TenantsService', [
      'showSpecialPoliciesByTenant',
    ]);

    TestBed.configureTestingModule({
      providers: [
        RateService,
        { provide: ParkingLotsService, useValue: parkingLotsServiceSpy },
        { provide: RatesService, useValue: ratesServiceSpy },
        { provide: TenantsService, useValue: tenantsServiceSpy },
      ],
    });

    service = TestBed.inject(RateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('simulateCalculation', () => {
    it('should compute hourly rate calculation accurately', () => {
      const res = service.simulateCalculation({
        basePrice: 5000,
        timeUnit: 'HOURS',
        durationInMinutes: 125, // 3 hours (ceil)
      });

      expect(res.unitsCalculated).toBe(3);
      expect(res.subtotal).toBe(15000);
      expect(res.total).toBe(15000);
    });

    it('should apply percentage surcharge special policy', () => {
      const policy: SpecialPolicyModel = {
        name: 'Peak Hours Surcharge',
        active: true,
        modifies: 'SURCHARGE',
        operation: 'PERCENTAGE',
        valueToModify: 20,
      };

      const res = service.simulateCalculation({
        basePrice: 5000,
        timeUnit: 'HOURS',
        durationInMinutes: 60,
        specialPolicy: policy,
      });

      expect(res.unitsCalculated).toBe(1);
      expect(res.subtotal).toBe(5000);
      expect(res.discountOrSurcharge).toBe(1000);
      expect(res.total).toBe(6000);
    });

    it('should apply discount policy', () => {
      const policy: SpecialPolicyModel = {
        name: 'Zone Discount',
        active: true,
        modifies: 'DISCOUNT',
        operation: 'PERCENTAGE',
        valueToModify: 10,
      };

      const res = service.simulateCalculation({
        basePrice: 10000,
        timeUnit: 'DAYS',
        durationInMinutes: 1440,
        specialPolicy: policy,
      });

      expect(res.unitsCalculated).toBe(1);
      expect(res.subtotal).toBe(10000);
      expect(res.discountOrSurcharge).toBe(-1000);
      expect(res.total).toBe(9000);
    });

    it('should calculate minute-based pricing correctly', () => {
      const res = service.simulateCalculation({
        basePrice: 100,
        timeUnit: 'MINUTES',
        durationInMinutes: 45,
      });

      expect(res.unitsCalculated).toBe(45);
      expect(res.subtotal).toBe(4500);
      expect(res.total).toBe(4500);
    });
  });

  describe('CRUD Operations', () => {
    it('should fetch rates by parking ID', (done) => {
      const mockResponse = {
        data: [
          {
            id: 'rate-1',
            name: 'Standard Car',
            vehicleType: 'CAR',
            timeUnit: 'HOURS',
            pricePerUnit: 4000,
            minChargeTimeMinutes: '15',
          },
        ],
      };

      parkingLotsServiceSpy.showRatesByParkingId.and.returnValue(of(mockResponse as any));

      service.getRatesByParkingId('parking-123').subscribe((rates) => {
        expect(rates.length).toBe(1);
        expect(rates[0].name).toBe('Standard Car');
        expect(rates[0].pricePerUnit).toBe(4000);
        expect(rates[0].minChargeTimeMinutes).toBe(15);
        done();
      });
    });
  });
});
