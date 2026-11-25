import type { OperationsKpiMetrics } from "@core/models/operations-cockpit.model";
import type { RateModel, VehicleType } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import type { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { normalizeRawPlate } from "@shared/utils/plate.utils";

import type { ScannedQrData } from "../components/modals/qr-scanner-modal/qr-scanner-modal";

export type CheckoutTicketMatchResult =
  | { status: "empty" }
  | { status: "matched"; ticket: TicketSummary }
  | { status: "multiple" }
  | { status: "none" };

export type ExpressCheckInValidationResult =
  | { status: "invalidPlate" }
  | { status: "noSlot"; vehicleType: VehicleType }
  | { cleanPlate: string; slot: SlotSummary; status: "ready" };

const VALID_VEHICLE_TYPES = new Set<string>(["CAR", "MOTORCYCLE", "BIKE"]);

const isKnownVehicleType = (value: string): value is VehicleType =>
  VALID_VEHICLE_TYPES.has(value);

const normalizeAlphanumericLower = (value: string): string =>
  value.replaceAll(/[^a-z0-9]/giu, "").toLowerCase();

const normalizeAlphanumericUpper = (value: string): string =>
  value.replaceAll(/[^a-zA-Z0-9]/gu, "").toUpperCase();

export const extractConfiguredVehicleTypes = (
  slots: SlotSummary[],
  rates: RateModel[]
): VehicleType[] => {
  const configuredTypes = new Set<VehicleType>();

  for (const slot of slots) {
    if (isKnownVehicleType(slot.type)) {
      configuredTypes.add(slot.type);
    }
  }

  for (const rate of rates) {
    if (isKnownVehicleType(rate.vehicleType)) {
      configuredTypes.add(rate.vehicleType);
    }
  }

  return [...configuredTypes];
};

export const resolveExpressVehicleType = (
  types: VehicleType[],
  previousType?: VehicleType
): VehicleType => {
  if (types.length === 1) {
    return types[0];
  }
  if (previousType && (types.length === 0 || types.includes(previousType))) {
    return previousType;
  }
  return types[0] ?? "CAR";
};

export const buildOperationsKpiMetrics = (
  slots: SlotSummary[]
): OperationsKpiMetrics => {
  const totalSlotsCount = slots.length;
  let availableSlotsCount = 0;
  let availableCarSlotsCount = 0;
  let totalCarSlotsCount = 0;
  let availableMotoSlotsCount = 0;
  let totalMotoSlotsCount = 0;
  let occupiedSlotsCount = 0;

  for (const slot of slots) {
    const isAvailable = slot.status === "AVAILABLE";
    if (isAvailable) {
      availableSlotsCount += 1;
    } else if (slot.status === "OCCUPIED") {
      occupiedSlotsCount += 1;
    }

    if (slot.type === "CAR") {
      totalCarSlotsCount += 1;
      if (isAvailable) {
        availableCarSlotsCount += 1;
      }
    } else if (slot.type === "MOTORCYCLE") {
      totalMotoSlotsCount += 1;
      if (isAvailable) {
        availableMotoSlotsCount += 1;
      }
    }
  }

  const occupationPercentage =
    totalSlotsCount === 0
      ? 0
      : Math.round((occupiedSlotsCount / totalSlotsCount) * 100);
  const occupationBarPercentage = Math.min(occupationPercentage, 100);

  return {
    availableCarSlotsCount,
    availableMotoSlotsCount,
    availableSlotsCount,
    occupationBarPercentage,
    occupationPercentage,
    occupiedSlotsCount,
    totalCarSlotsCount,
    totalMotoSlotsCount,
    totalSlotsCount,
  };
};

export const filterOperationsSlots = (
  slots: SlotSummary[],
  vehicleFilter: string,
  statusFilter: string
): SlotSummary[] =>
  slots.filter((slot) => {
    const matchesVehicle =
      vehicleFilter === "ALL" || slot.type === vehicleFilter;
    const matchesStatus =
      statusFilter === "ALL" || slot.status === statusFilter;
    return matchesVehicle && matchesStatus;
  });

export const filterActiveTicketsByQuery = (
  tickets: TicketSummary[],
  rawQuery: string
): TicketSummary[] => {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return tickets;
  }

  return tickets.filter((ticket) => {
    const plate = (ticket.licensePlate ?? "").toLowerCase();
    const slotNumber = (ticket.slotNumber ?? "").toLowerCase();
    return (
      plate.includes(normalizedQuery) || slotNumber.includes(normalizedQuery)
    );
  });
};

export const findCheckoutTicketMatch = (
  tickets: TicketSummary[],
  rawQuery: string
): CheckoutTicketMatchResult => {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return { status: "empty" };
  }

  const alphanumericQuery = normalizeAlphanumericLower(normalizedQuery);
  const matches = tickets.filter((ticket) => {
    const plate = (ticket.licensePlate ?? "").toLowerCase();
    const slotNumber = (ticket.slotNumber ?? "").toLowerCase();
    const normalizedPlate = normalizeAlphanumericLower(plate);
    const normalizedSlot = normalizeAlphanumericLower(slotNumber);

    return (
      plate.includes(normalizedQuery) ||
      slotNumber.includes(normalizedQuery) ||
      (alphanumericQuery.length >= 2 &&
        (normalizedPlate.includes(alphanumericQuery) ||
          normalizedSlot.includes(alphanumericQuery)))
    );
  });

  if (matches.length === 1) {
    return { status: "matched", ticket: matches[0] };
  }

  const exactMatch = matches.find((ticket) => {
    const plate = (ticket.licensePlate ?? "").toLowerCase();
    const slotNumber = (ticket.slotNumber ?? "").toLowerCase();
    const normalizedPlate = normalizeAlphanumericLower(plate);
    const normalizedSlot = normalizeAlphanumericLower(slotNumber);

    return (
      plate === normalizedQuery ||
      slotNumber === normalizedQuery ||
      (alphanumericQuery.length >= 3 &&
        (normalizedPlate === alphanumericQuery ||
          normalizedSlot === alphanumericQuery))
    );
  });

  if (exactMatch) {
    return { status: "matched", ticket: exactMatch };
  }

  if (matches.length > 1) {
    return { status: "multiple" };
  }

  return { status: "none" };
};

export const findTicketByScannedQr = (
  tickets: TicketSummary[],
  data: ScannedQrData
): TicketSummary | null => {
  if (data.ticketId) {
    const matchById = tickets.find((ticket) => ticket.id === data.ticketId);
    if (matchById) {
      return matchById;
    }
  }

  if (data.plate) {
    const cleanScannedPlate = normalizeAlphanumericUpper(data.plate);
    const matchByPlate = tickets.find((ticket) => {
      const cleanTicketPlate = normalizeAlphanumericUpper(
        ticket.licensePlate ?? ""
      );
      return cleanTicketPlate === cleanScannedPlate;
    });
    if (matchByPlate) {
      return matchByPlate;
    }
  }

  return null;
};

export const buildQrNotFoundIdentifier = (
  data: ScannedQrData,
  toastsTexts: typeof APP_TEXTS.operations.toasts
): string => {
  if (data.ticketId) {
    return toastsTexts.qrTicketPrefix(data.ticketId.slice(0, 8));
  }

  if (data.plate) {
    return toastsTexts.qrPlatePrefix(data.plate);
  }

  return toastsTexts.qrScannedFallback;
};

export const validateExpressCheckIn = (
  slots: SlotSummary[],
  rawPlate: string,
  vehicleType: VehicleType
): ExpressCheckInValidationResult => {
  const cleanPlate = normalizeRawPlate(rawPlate);
  if (cleanPlate.length < 3 || cleanPlate.length > 7) {
    return { status: "invalidPlate" };
  }

  const availableSlot = slots.find(
    (slot) => slot.status === "AVAILABLE" && slot.type === vehicleType
  );
  if (!availableSlot) {
    return { status: "noSlot", vehicleType };
  }

  return { cleanPlate, slot: availableSlot, status: "ready" };
};
