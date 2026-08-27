import { CreateRate, RatesDto, SpecialPoliciesDto, SpecialPoliciesInfo, UpdateRate } from '@core/api/generated/models';
import { CreateRateModel, RateModel, SpecialPolicyModel, UpdateRateModel } from '@core/models/rate.model';

export function mapToSpecialPolicyModel(data?: SpecialPoliciesInfo | SpecialPoliciesDto | null): SpecialPolicyModel | undefined {
  if (!data) return undefined;
  return {
    id: data.id,
    name: data.name ?? '',
    active: data.active ?? true,
    modifies: (data.modifies as SpecialPolicyModel['modifies']) ?? 'PRICE',
    operation: (data.operation as SpecialPolicyModel['operation']) ?? 'PERCENTAGE',
    valueToModify: data.valueToModify ?? 0,
  };
}

export function mapToRateModel(data: RatesDto): RateModel {
  return {
    id: data.id ?? '',
    name: data.name ?? '',
    description: data.description ?? '',
    vehicleType: data.vehicleType ?? 'CAR',
    timeUnit: data.timeUnit ?? 'HOURS',
    pricePerUnit: data.pricePerUnit ?? 0,
    minChargeTimeMinutes: data.minChargeTimeMinutes ? parseInt(data.minChargeTimeMinutes, 10) || 0 : 0,
    parkingId: data.parking?.id ?? '',
    specialPolicy: mapToSpecialPolicyModel(data.specialPolicy),
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  };
}

export function mapToCreateRateDto(model: CreateRateModel): CreateRate {
  return {
    parkingLotId: model.parkingId,
    name: model.name,
    description: model.description ?? '',
    vehicleType: model.vehicleType,
    timeUnit: model.timeUnit,
    pricePerUnit: model.pricePerUnit,
    minChargeTimeMinutes: (model.minChargeTimeMinutes ?? 0).toString(),
    specialPolicyId: model.specialPolicyId,
  };
}

export function mapToUpdateRateDto(model: UpdateRateModel): UpdateRate {
  return {
    id: model.id,
    name: model.name ?? '',
    description: model.description ?? '',
    vehicleType: model.vehicleType ?? 'CAR',
    timeUnit: model.timeUnit ?? 'HOURS',
    pricePerUnit: model.pricePerUnit ?? 0,
    minChargeTimeMinutes: (model.minChargeTimeMinutes ?? 0).toString(),
  };
}
