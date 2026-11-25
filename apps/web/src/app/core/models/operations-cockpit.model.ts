import type { VehicleType } from "./rate.model";

export interface OperationsKpiMetrics {
  availableCarSlotsCount: number;
  availableMotoSlotsCount: number;
  availableSlotsCount: number;
  occupationBarPercentage: number;
  occupationPercentage: number;
  occupiedSlotsCount: number;
  totalCarSlotsCount: number;
  totalMotoSlotsCount: number;
  totalSlotsCount: number;
}

export interface OperationsOmnibarState {
  availableCarSlotsCount: number;
  availableMotoSlotsCount: number;
  expressPlate: string;
  expressVehicleType: VehicleType;
  hasMultipleVehicleTypes: boolean;
  isSubmittingExpressCheckIn: boolean;
  searchTicketQuery: string;
}

export type OperationsOmnibarAction =
  | { type: "openQrScanner" }
  | { type: "openUnplatedCheckIn" }
  | { plate: string; type: "updatePlate" }
  | { query: string; type: "updateSearchQuery" }
  | { type: "selectVehicleType"; vehicleType: VehicleType }
  | { type: "submitCheckIn" }
  | { type: "submitCheckOut" };

export interface OperationsSlotsGridFilters {
  statusFilter: string;
  vehicleFilter: string;
}

export type OperationsSlotsFilterAction =
  | { type: "reset" }
  | { type: "status"; value: string }
  | { type: "vehicle"; value: string };

export interface OperationsFilterOption {
  activeClass: string;
  label: string;
  value: string;
}

export interface OperationsKpiVehicleCard {
  available: number;
  barClass: string;
  icon: string;
  iconBoxClass: string;
  id: string;
  label: string;
  occupiedPct: number;
  total: number;
}

export interface OperationsVehicleToggleOption {
  availableCount: number;
  icon: string;
  label: string;
  type: VehicleType;
}
