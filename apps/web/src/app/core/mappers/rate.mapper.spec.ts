import {
  mapFormToCreateRateModel,
  mapFormToUpdateRateModel,
  mapToCreateRateDto,
  mapToRateModel,
  mapToSpecialPolicyModel,
  mapToUpdateRateDto,
} from './rate.mapper';
import { CreateRateModel, UpdateRateModel } from '@core/models/rate.model';
import { RatesDto, SpecialPoliciesInfo } from '@core/api/generated/models';

describe('RateMapper', () => {
  describe('mapToSpecialPolicyModel', () => {
    it('should return undefined when input is null or undefined', () => {
      expect(mapToSpecialPolicyModel(null)).toBeUndefined();
      expect(mapToSpecialPolicyModel(undefined)).toBeUndefined();
    });

    it('should map SpecialPoliciesInfo to SpecialPolicyModel', () => {
      const dto: SpecialPoliciesInfo = {
        id: 'policy-1',
        name: 'VIP Surcharge',
        active: true,
        modifies: 'SURCHARGE',
        operation: 'PERCENTAGE',
        valueToModify: 20,
      };

      const result = mapToSpecialPolicyModel(dto);

      expect(result).toEqual({
        id: 'policy-1',
        name: 'VIP Surcharge',
        active: true,
        modifies: 'SURCHARGE',
        operation: 'PERCENTAGE',
        valueToModify: 20,
      });
    });
  });

  describe('mapToRateModel', () => {
    it('should map RatesDto to RateModel with nested special policy', () => {
      const dto: RatesDto = {
        id: 'rate-1',
        name: 'Car Hourly',
        description: 'Standard car rate',
        vehicleType: 'CAR',
        timeUnit: 'HOURS',
        pricePerUnit: 5000,
        minChargeTimeMinutes: '15',
        parking: { id: 'parking-1' },
        specialPolicy: {
          id: 'sp-1',
          name: 'Night Discount',
          active: true,
          modifies: 'DISCOUNT',
          operation: 'PERCENTAGE',
          valueToModify: 10,
        },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      };

      const result = mapToRateModel(dto);

      expect(result.id).toBe('rate-1');
      expect(result.name).toBe('Car Hourly');
      expect(result.vehicleType).toBe('CAR');
      expect(result.timeUnit).toBe('HOURS');
      expect(result.pricePerUnit).toBe(5000);
      expect(result.minChargeTimeMinutes).toBe(15);
      expect(result.parkingId).toBe('parking-1');
      expect(result.specialPolicy?.name).toBe('Night Discount');
    });

    it('should fallback defaults when optional fields are missing', () => {
      const dto: RatesDto = {};
      const result = mapToRateModel(dto);

      expect(result.id).toBe('');
      expect(result.vehicleType).toBe('CAR');
      expect(result.timeUnit).toBe('HOURS');
      expect(result.pricePerUnit).toBe(0);
      expect(result.minChargeTimeMinutes).toBe(0);
      expect(result.specialPolicy).toBeUndefined();
    });
  });

  describe('mapToCreateRateDto', () => {
    it('should map CreateRateModel to CreateRate DTO', () => {
      const model: CreateRateModel = {
        parkingId: 'parking-123',
        name: 'Bike Minute',
        description: 'Per minute charge',
        vehicleType: 'BIKE',
        timeUnit: 'MINUTES',
        pricePerUnit: 100,
        minChargeTimeMinutes: 5,
        specialPolicyId: 'sp-99',
      };

      const dto = mapToCreateRateDto(model);

      expect(dto.parkingLotId).toBe('parking-123');
      expect(dto.name).toBe('Bike Minute');
      expect(dto.vehicleType).toBe('BIKE');
      expect(dto.timeUnit).toBe('MINUTES');
      expect(dto.pricePerUnit).toBe(100);
      expect(dto.minChargeTimeMinutes).toBe('5');
      expect(dto.specialPolicyId).toBe('sp-99');
    });
  });

  describe('mapToUpdateRateDto', () => {
    it('should map UpdateRateModel to UpdateRate DTO', () => {
      const model: UpdateRateModel = {
        id: 'rate-1',
        name: 'Updated Rate',
        vehicleType: 'MOTORCYCLE',
        timeUnit: 'HOURS',
        pricePerUnit: 2500,
        minChargeTimeMinutes: 10,
      };

      const dto = mapToUpdateRateDto(model);

      expect(dto.id).toBe('rate-1');
      expect(dto.name).toBe('Updated Rate');
      expect(dto.vehicleType).toBe('MOTORCYCLE');
      expect(dto.pricePerUnit).toBe(2500);
      expect(dto.minChargeTimeMinutes).toBe('10');
    });
  });

  describe('mapFormToCreateRateModel', () => {
    it('should map RateFormData to CreateRateModel', () => {
      const form = {
        name: ' Tarifa Carro ',
        description: ' Cobro por hora ',
        vehicleType: 'CAR' as const,
        timeUnit: 'HOURS' as const,
        pricePerUnit: 5000,
        minChargeTimeMinutes: 15,
        specialPolicyId: 'policy-1',
      };

      const model = mapFormToCreateRateModel(form, 'parking-1');

      expect(model).toEqual({
        parkingId: 'parking-1',
        name: 'Tarifa Carro',
        description: 'Cobro por hora',
        vehicleType: 'CAR',
        timeUnit: 'HOURS',
        pricePerUnit: 5000,
        minChargeTimeMinutes: 15,
        specialPolicyId: 'policy-1',
      });
    });
  });

  describe('mapFormToUpdateRateModel', () => {
    it('should map RateFormData to UpdateRateModel', () => {
      const form = {
        name: ' Tarifa Moto ',
        description: ' Cobro moto ',
        vehicleType: 'MOTORCYCLE' as const,
        timeUnit: 'HOURS' as const,
        pricePerUnit: 2500,
        minChargeTimeMinutes: 10,
      };

      const model = mapFormToUpdateRateModel(form, 'rate-123');

      expect(model).toEqual({
        id: 'rate-123',
        name: 'Tarifa Moto',
        description: 'Cobro moto',
        vehicleType: 'MOTORCYCLE',
        timeUnit: 'HOURS',
        pricePerUnit: 2500,
        minChargeTimeMinutes: 10,
      });
    });
  });
});

