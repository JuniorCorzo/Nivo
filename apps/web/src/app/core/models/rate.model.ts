export type TimeUnit = "MINUTES" | "HOURS" | "DAYS";
export type VehicleType = "CAR" | "MOTORCYCLE" | "BIKE";
export type RatePolicyOperation = "SUBTRACT" | "PERCENTAGE" | "SET";
export type RatePolicyTarget = "PRICE" | "TIME" | "DISCOUNT" | "SURCHARGE";

export interface SpecialPolicyModel {
  id?: string;
  name: string;
  active: boolean;
  modifies: RatePolicyTarget;
  operation: RatePolicyOperation;
  valueToModify: number;
}

export interface RateModel {
  id: string;
  name: string;
  description: string;
  vehicleType: VehicleType;
  timeUnit: TimeUnit;
  pricePerUnit: number;
  minChargeTimeMinutes: number;
  parkingId: string;
  specialPolicy?: SpecialPolicyModel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateModel {
  parkingId: string;
  name: string;
  description?: string;
  vehicleType: VehicleType;
  timeUnit: TimeUnit;
  pricePerUnit: number;
  minChargeTimeMinutes: number;
  specialPolicyId?: string;
}

export interface UpdateRateModel {
  id: string;
  name?: string;
  description?: string;
  vehicleType?: VehicleType;
  timeUnit?: TimeUnit;
  pricePerUnit?: number;
  minChargeTimeMinutes?: number;
  specialPolicyId?: string;
}

export interface SimulateRateParams {
  vehicleType: VehicleType;
  minutesStayed: number;
  pricePerUnit?: number;
  timeUnit?: TimeUnit;
  gracePeriodMinutes?: number;
  ivaRate?: number;
}

export interface SimulateRatePriceLine {
  concept: string;
  amount: number;
}

export interface SimulateRateResult {
  name: string;
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
  breakpoints: SimulateRatePriceLine[];
}
