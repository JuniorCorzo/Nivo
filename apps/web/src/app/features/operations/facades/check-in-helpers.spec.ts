import type { RateModel } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";

import {
  KNOWN_VEHICLE_TYPES,
  buildCheckInPayload,
  findFirstAvailableSlotId,
  findFirstRateId,
  getAvailableVehicleTypes,
  getConfiguredVehicleTypes,
  isValidEmailFormat,
  resolveDefaultVehicleType,
} from "./check-in.helpers";

const makeSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
  hasCharger: false,
  id: "slot-1",
  isAccessible: false,
  isActive: true,
  parkingName: "Central",
  prefix: "A",
  slotNumber: "101",
  status: "AVAILABLE",
  type: "CAR",
  zone: "Z1",
  ...overrides,
});

const makeRate = (overrides: Partial<RateModel> = {}): RateModel => ({
  createdAt: "",
  description: "Hourly",
  id: "rate-1",
  minChargeTimeMinutes: 15,
  name: "Car Rate",
  parkingId: "parking-1",
  pricePerUnit: 4000,
  timeUnit: "HOURS",
  updatedAt: "",
  vehicleType: "CAR",
  ...overrides,
});

describe("check-in.helpers", () => {
  it("exposes KNOWN_VEHICLE_TYPES in canonical order", () => {
    expect(KNOWN_VEHICLE_TYPES).toEqual(["CAR", "MOTORCYCLE", "BIKE"]);
  });

  describe("getAvailableVehicleTypes", () => {
    it("returns only vehicle types with AVAILABLE slots in canonical order", () => {
      const slots = [
        makeSlot({ id: "s1", status: "OCCUPIED", type: "CAR" }),
        makeSlot({ id: "s2", status: "AVAILABLE", type: "BIKE" }),
        makeSlot({ id: "s3", status: "AVAILABLE", type: "MOTORCYCLE" }),
        makeSlot({ id: "s4", status: "AVAILABLE", type: "MOTORCYCLE" }),
      ];

      expect(getAvailableVehicleTypes(slots)).toEqual(["MOTORCYCLE", "BIKE"]);
    });

    it("returns an empty array when no slots are available", () => {
      const slots = [makeSlot({ status: "OCCUPIED", type: "CAR" })];
      expect(getAvailableVehicleTypes(slots)).toEqual([]);
      expect(getAvailableVehicleTypes([])).toEqual([]);
    });
  });

  describe("getConfiguredVehicleTypes", () => {
    it("combines slot and rate vehicle types in canonical order", () => {
      const slots = [makeSlot({ status: "OCCUPIED", type: "BIKE" })];
      const rates = [
        makeRate({ id: "r1", vehicleType: "CAR" }),
        makeRate({ id: "r2", vehicleType: undefined }),
      ];

      expect(getConfiguredVehicleTypes(slots, rates)).toEqual(["CAR", "BIKE"]);
    });

    it("returns an empty array when neither slots nor rates define types", () => {
      expect(getConfiguredVehicleTypes([], [])).toEqual([]);
    });
  });

  describe("resolveDefaultVehicleType", () => {
    it("returns the single configured type regardless of availability", () => {
      expect(resolveDefaultVehicleType(["MOTORCYCLE"], [], "CAR")).toBe(
        "MOTORCYCLE"
      );
      expect(resolveDefaultVehicleType(["BIKE"], ["CAR", "BIKE"], "CAR")).toBe(
        "BIKE"
      );
    });

    it("returns null when multiple or zero types are configured and none are available", () => {
      expect(
        resolveDefaultVehicleType(["CAR", "MOTORCYCLE"], [], "CAR")
      ).toBeNull();
      expect(resolveDefaultVehicleType([], [], "CAR")).toBeNull();
    });

    it("keeps current type when it is available, otherwise falls back to first available", () => {
      expect(
        resolveDefaultVehicleType(
          ["CAR", "MOTORCYCLE"],
          ["CAR", "MOTORCYCLE"],
          "MOTORCYCLE"
        )
      ).toBe("MOTORCYCLE");

      expect(
        resolveDefaultVehicleType(
          ["CAR", "MOTORCYCLE"],
          ["MOTORCYCLE", "BIKE"],
          "CAR"
        )
      ).toBe("MOTORCYCLE");
    });
  });

  describe("findFirstAvailableSlotId", () => {
    it("returns the first AVAILABLE slot ID for the given vehicle type", () => {
      const slots = [
        makeSlot({ id: "car-occ", status: "OCCUPIED", type: "CAR" }),
        makeSlot({ id: "moto-avail", status: "AVAILABLE", type: "MOTORCYCLE" }),
        makeSlot({ id: "car-avail-1", status: "AVAILABLE", type: "CAR" }),
        makeSlot({ id: "car-avail-2", status: "AVAILABLE", type: "CAR" }),
      ];

      expect(findFirstAvailableSlotId(slots, "CAR")).toBe("car-avail-1");
      expect(findFirstAvailableSlotId(slots, "BIKE")).toBeNull();
    });
  });

  describe("findFirstRateId", () => {
    it("returns the first rate ID matching the given vehicle type or null", () => {
      const rates = [
        makeRate({ id: "rate-moto", vehicleType: "MOTORCYCLE" }),
        makeRate({ id: "rate-car-1", vehicleType: "CAR" }),
        makeRate({ id: "rate-car-2", vehicleType: "CAR" }),
      ];

      expect(findFirstRateId(rates, "CAR")).toBe("rate-car-1");
      expect(findFirstRateId(rates, "BIKE")).toBeNull();
    });
  });

  describe("isValidEmailFormat", () => {
    it("accepts empty/whitespace strings and valid email addresses", () => {
      expect(isValidEmailFormat("")).toBe(true);
      expect(isValidEmailFormat("   ")).toBe(true);
      expect(isValidEmailFormat("  user@example.com  ")).toBe(true);
    });

    it("rejects malformed email addresses", () => {
      expect(isValidEmailFormat("@")).toBe(false);
      expect(isValidEmailFormat("user@")).toBe(false);
      expect(isValidEmailFormat("user@domain")).toBe(false);
      expect(isValidEmailFormat("user name@domain.com")).toBe(false);
    });
  });

  describe("buildCheckInPayload", () => {
    it("falls back to SIN PLACA for UNPLATED with blank plate and preserves photoUrl", () => {
      expect(
        buildCheckInPayload({
          deliveryMethod: "WHATSAPP",
          email: "ignored@example.com",
          phoneNumber: " 3001234567 ",
          photoUrl: "data:image/jpeg;base64,abc",
          plate: "   ",
          plateCountry: "UNPLATED",
          rateId: "rate-moto",
          slotId: "slot-moto",
        })
      ).toEqual({
        email: undefined,
        phoneNumber: "3001234567",
        photoUrl: "data:image/jpeg;base64,abc",
        plate: "SIN PLACA",
        plateCountry: "UNPLATED",
        rateId: "rate-moto",
        slotId: "slot-moto",
      });
    });

    it("normalizes plate and sends only email when deliveryMethod is EMAIL", () => {
      expect(
        buildCheckInPayload({
          deliveryMethod: "EMAIL",
          email: " user@example.com ",
          phoneNumber: "3001234567",
          photoUrl: null,
          plate: "  abc-123 ",
          plateCountry: "CO",
          rateId: "rate-car",
          slotId: "slot-car",
        })
      ).toEqual({
        email: "user@example.com",
        phoneNumber: undefined,
        photoUrl: undefined,
        plate: "ABC-123",
        plateCountry: "CO",
        rateId: "rate-car",
        slotId: "slot-car",
      });
    });

    it("omits both email and phoneNumber when deliveryMethod is PRINT", () => {
      expect(
        buildCheckInPayload({
          deliveryMethod: "PRINT",
          email: "user@example.com",
          phoneNumber: "3001234567",
          photoUrl: "",
          plate: "ab-123-cd",
          plateCountry: "VE",
          rateId: "rate-car",
          slotId: "slot-car",
        })
      ).toEqual({
        email: undefined,
        phoneNumber: undefined,
        photoUrl: undefined,
        plate: "AB-123-CD",
        plateCountry: "VE",
        rateId: "rate-car",
        slotId: "slot-car",
      });
    });
  });
});
