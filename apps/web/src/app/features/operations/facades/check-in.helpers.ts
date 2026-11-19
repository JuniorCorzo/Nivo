import type { RateModel, VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type {
  CreateTicketPayload,
  PlateCountry,
} from "@core/models/ticket.model";

export const KNOWN_VEHICLE_TYPES: readonly VehicleType[] = [
  "CAR",
  "MOTORCYCLE",
  "BIKE",
];

/**
 * Returns known vehicle types that currently have at least one available slot.
 */
export const getAvailableVehicleTypes = (
  slots: readonly SlotSummary[]
): VehicleType[] => {
  const availableTypes = new Set(
    slots.filter((slot) => slot.status === "AVAILABLE").map((slot) => slot.type)
  );
  return KNOWN_VEHICLE_TYPES.filter((type) => availableTypes.has(type));
};

/**
 * Returns known vehicle types configured across slots or rates for a parking lot.
 */
export const getConfiguredVehicleTypes = (
  slots: readonly SlotSummary[],
  rates: readonly RateModel[]
): VehicleType[] => {
  const slotTypes = new Set(slots.map((slot) => slot.type));
  const rateTypes = new Set(
    rates
      .map((rate) => rate.vehicleType)
      .filter((type): type is VehicleType => Boolean(type))
  );
  return KNOWN_VEHICLE_TYPES.filter(
    (type) => slotTypes.has(type) || rateTypes.has(type)
  );
};

/**
 * Resolves the default vehicle type from configured and available types.
 */
export const resolveDefaultVehicleType = (
  configured: readonly VehicleType[],
  available: readonly VehicleType[],
  current: VehicleType
): VehicleType | null => {
  if (configured.length === 1) {
    return configured[0];
  }
  if (available.length === 0) {
    return null;
  }
  return available.includes(current) ? current : available[0];
};

/**
 * Finds the first available slot ID matching the given vehicle type.
 */
export const findFirstAvailableSlotId = (
  slots: readonly SlotSummary[],
  type: VehicleType
): string | null =>
  slots.find((slot) => slot.status === "AVAILABLE" && slot.type === type)?.id ??
  null;

/**
 * Finds the first rate ID matching the given vehicle type.
 */
export const findFirstRateId = (
  rates: readonly RateModel[],
  type: VehicleType
): string | null => rates.find((rate) => rate.vehicleType === type)?.id ?? null;

/**
 * Validates optional email format; empty or whitespace-only strings are valid.
 */
export const isValidEmailFormat = (email: string): boolean => {
  const trimmed = email.trim();
  return !trimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(trimmed);
};

/**
 * Builds the ticket creation payload, normalizing plate and channel-specific contact fields.
 */
export const buildCheckInPayload = (params: {
  deliveryMethod: "PRINT" | "WHATSAPP" | "EMAIL";
  email: string;
  phoneNumber: string;
  photoUrl: string | null;
  plate: string;
  plateCountry: PlateCountry;
  rateId: string;
  slotId: string;
}): CreateTicketPayload => {
  const normalizedPlate = params.plate.trim().toUpperCase();
  const plate =
    params.plateCountry === "UNPLATED"
      ? normalizedPlate || "SIN PLACA"
      : normalizedPlate;
  const emailToSend =
    (params.deliveryMethod === "EMAIL" && params.email.trim()) || undefined;
  const phoneToSend =
    (params.deliveryMethod === "WHATSAPP" && params.phoneNumber.trim()) ||
    undefined;

  return {
    email: emailToSend,
    phoneNumber: phoneToSend,
    photoUrl: params.photoUrl || undefined,
    plate,
    plateCountry: params.plateCountry,
    rateId: params.rateId,
    slotId: params.slotId,
  };
};
