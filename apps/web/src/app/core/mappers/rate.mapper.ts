import type {
  CreateRate,
  RatesDto,
  SpecialPoliciesDto,
  SpecialPoliciesInfo,
  UpdateRate,
} from "@core/api/generated/models";
import type {
  CreateRateModel,
  RateModel,
  SpecialPolicyModel,
  UpdateRateModel,
} from "@core/models/rate.model";

export const mapToSpecialPolicyModel = (
  data?: SpecialPoliciesInfo | SpecialPoliciesDto | null
): SpecialPolicyModel | undefined => {
  if (!data) {
    return undefined;
  }
  /* SAFETY: Backend enum values for modifies match SpecialPolicyModel */
  const modifies = (data.modifies as SpecialPolicyModel["modifies"]) ?? "PRICE";
  /* SAFETY: Backend enum values for operation match SpecialPolicyModel */
  const operation =
    (data.operation as SpecialPolicyModel["operation"]) ?? "PERCENTAGE";

  return {
    active: data.active ?? true,
    id: data.id,
    modifies,
    name: data.name ?? "",
    operation,
    valueToModify: data.valueToModify ?? 0,
  };
};

export const mapToRateModel = (data: RatesDto): RateModel => ({
  createdAt: data.createdAt ?? "",
  description: data.description ?? "",
  id: data.id ?? "",
  minChargeTimeMinutes: data.minChargeTimeMinutes
    ? Math.trunc(Number(data.minChargeTimeMinutes)) || 0
    : 0,
  name: data.name ?? "",
  parkingId: data.parking?.id ?? "",
  pricePerUnit: data.pricePerUnit ?? 0,
  specialPolicy: mapToSpecialPolicyModel(data.specialPolicy),
  timeUnit: data.timeUnit ?? "HOURS",
  updatedAt: data.updatedAt ?? "",
  vehicleType: data.vehicleType ?? "CAR",
});

export const mapToCreateRateDto = (model: CreateRateModel): CreateRate => ({
  description: model.description ?? "",
  minChargeTimeMinutes: (model.minChargeTimeMinutes ?? 0).toString(),
  name: model.name,
  parkingLotId: model.parkingId,
  pricePerUnit: model.pricePerUnit,
  specialPolicyId: model.specialPolicyId,
  timeUnit: model.timeUnit,
  vehicleType: model.vehicleType,
});

export const mapToUpdateRateDto = (model: UpdateRateModel): UpdateRate => ({
  description: model.description ?? "",
  id: model.id,
  minChargeTimeMinutes: (model.minChargeTimeMinutes ?? 0).toString(),
  name: model.name ?? "",
  pricePerUnit: model.pricePerUnit ?? 0,
  timeUnit: model.timeUnit ?? "HOURS",
  vehicleType: model.vehicleType ?? "CAR",
});

export interface RateFormData {
  name: string;
  description: string;
  vehicleType: RateModel["vehicleType"];
  timeUnit: RateModel["timeUnit"];
  pricePerUnit: number;
  minChargeTimeMinutes: number;
  specialPolicyId?: string | null;
}

export const mapFormToCreateRateModel = (
  form: RateFormData,
  parkingId: string
): CreateRateModel => ({
  description: form.description.trim(),
  minChargeTimeMinutes: form.minChargeTimeMinutes,
  name: form.name.trim(),
  parkingId,
  pricePerUnit: form.pricePerUnit,
  specialPolicyId: form.specialPolicyId ?? undefined,
  timeUnit: form.timeUnit,
  vehicleType: form.vehicleType,
});

export const mapFormToUpdateRateModel = (
  form: RateFormData,
  id: string
): UpdateRateModel => ({
  description: form.description.trim(),
  id,
  minChargeTimeMinutes: form.minChargeTimeMinutes,
  name: form.name.trim(),
  pricePerUnit: form.pricePerUnit,
  timeUnit: form.timeUnit,
  vehicleType: form.vehicleType,
});
