import type { RateModel } from "@core/models/rate.model";
import type { SlotSummary } from "@core/models/slot.model";
import type { TicketSummary } from "@core/models/ticket.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import {
  buildOperationsKpiMetrics,
  buildQrNotFoundIdentifier,
  extractConfiguredVehicleTypes,
  filterActiveTicketsByQuery,
  filterOperationsSlots,
  findCheckoutTicketMatch,
  findTicketByScannedQr,
  resolveExpressVehicleType,
  validateExpressCheckIn,
} from "./operations-cockpit.helpers";

const createSlot = (overrides: Partial<SlotSummary> = {}): SlotSummary => ({
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

const createRate = (overrides: Partial<RateModel> = {}): RateModel => ({
  createdAt: "",
  description: "",
  id: "rate-1",
  minChargeTimeMinutes: 15,
  name: "Tarifa Carro",
  parkingId: "parking-1",
  pricePerUnit: 5000,
  timeUnit: "HOURS",
  updatedAt: "",
  vehicleType: "CAR",
  ...overrides,
});

const createTicket = (
  overrides: Partial<TicketSummary> = {}
): TicketSummary => ({
  entryTime: "2026-10-16T10:00:00Z",
  id: "ticket-1",
  licensePlate: "ABC-123",
  plateCountry: "CO",
  slotId: "slot-2",
  slotNumber: "102",
  status: "OPEN",
  ...overrides,
});

describe("operations-cockpit.helpers", () => {
  describe("extractConfiguredVehicleTypes", () => {
    it("should return empty array when both slots and rates are empty", () => {
      expect(extractConfiguredVehicleTypes([], [])).toEqual([]);
    });

    it("should deduplicate vehicle types across slots and rates preserving discovery order", () => {
      const slots = [
        createSlot({ id: "slot-1", type: "CAR" }),
        createSlot({ id: "slot-2", type: "CAR" }),
        createSlot({ id: "slot-3", type: "MOTORCYCLE" }),
      ];
      const rates = [
        createRate({ id: "rate-1", vehicleType: "MOTORCYCLE" }),
        createRate({ id: "rate-2", vehicleType: "BIKE" }),
      ];

      expect(extractConfiguredVehicleTypes(slots, rates)).toEqual([
        "CAR",
        "MOTORCYCLE",
        "BIKE",
      ]);
    });

    it("should ignore unknown slot or rate vehicle types", () => {
      const slots = [
        createSlot({ id: "slot-1", type: "TRUCK" as SlotSummary["type"] }),
        createSlot({ id: "slot-2", type: "BIKE" }),
      ];
      const rates = [
        createRate({
          id: "rate-1",
          vehicleType: "BUS" as RateModel["vehicleType"],
        }),
      ];

      expect(extractConfiguredVehicleTypes(slots, rates)).toEqual(["BIKE"]);
    });
  });

  describe("buildOperationsKpiMetrics", () => {
    it("should return all zeros without division by zero when slots array is empty", () => {
      expect(buildOperationsKpiMetrics([])).toEqual({
        availableCarSlotsCount: 0,
        availableMotoSlotsCount: 0,
        availableSlotsCount: 0,
        occupationBarPercentage: 0,
        occupationPercentage: 0,
        occupiedSlotsCount: 0,
        totalCarSlotsCount: 0,
        totalMotoSlotsCount: 0,
        totalSlotsCount: 0,
      });
    });

    it("should accurately count slot categories and round occupation percentage", () => {
      const slots = [
        createSlot({ id: "slot-1", status: "AVAILABLE", type: "CAR" }),
        createSlot({ id: "slot-2", status: "OCCUPIED", type: "CAR" }),
        createSlot({ id: "slot-3", status: "OCCUPIED", type: "CAR" }),
        createSlot({ id: "slot-4", status: "AVAILABLE", type: "MOTORCYCLE" }),
        createSlot({ id: "slot-5", status: "OCCUPIED", type: "MOTORCYCLE" }),
        createSlot({ id: "slot-6", status: "MAINTENANCE", type: "BIKE" }),
      ];

      expect(buildOperationsKpiMetrics(slots)).toEqual({
        availableCarSlotsCount: 1,
        availableMotoSlotsCount: 1,
        availableSlotsCount: 2,
        occupationBarPercentage: 50,
        occupationPercentage: 50,
        occupiedSlotsCount: 3,
        totalCarSlotsCount: 3,
        totalMotoSlotsCount: 2,
        totalSlotsCount: 6,
      });
    });

    it("should round non-integer occupation percentage and cap bar percentage at 100", () => {
      const slots = [
        createSlot({ id: "slot-1", status: "OCCUPIED", type: "CAR" }),
        createSlot({ id: "slot-2", status: "OCCUPIED", type: "CAR" }),
        createSlot({ id: "slot-3", status: "AVAILABLE", type: "CAR" }),
      ];

      const metrics = buildOperationsKpiMetrics(slots);
      expect(metrics.occupationPercentage).toBe(67);
      expect(metrics.occupationBarPercentage).toBe(67);
    });
  });

  describe("filterOperationsSlots", () => {
    const slots = [
      createSlot({ id: "slot-1", status: "AVAILABLE", type: "CAR" }),
      createSlot({ id: "slot-2", status: "OCCUPIED", type: "CAR" }),
      createSlot({ id: "slot-3", status: "AVAILABLE", type: "MOTORCYCLE" }),
    ];

    it("should return all slots when both filters are ALL", () => {
      expect(filterOperationsSlots(slots, "ALL", "ALL")).toEqual(slots);
    });

    it("should filter by vehicle type only", () => {
      expect(
        filterOperationsSlots(slots, "CAR", "ALL").map((slot) => slot.id)
      ).toEqual(["slot-1", "slot-2"]);
    });

    it("should filter by status only", () => {
      expect(
        filterOperationsSlots(slots, "ALL", "AVAILABLE").map((slot) => slot.id)
      ).toEqual(["slot-1", "slot-3"]);
    });

    it("should filter by both vehicle type and status", () => {
      expect(
        filterOperationsSlots(slots, "CAR", "AVAILABLE").map((slot) => slot.id)
      ).toEqual(["slot-1"]);
    });
  });

  describe("filterActiveTicketsByQuery", () => {
    const tickets = [
      createTicket({
        id: "ticket-1",
        licensePlate: "ABC-123",
        slotNumber: "101",
      }),
      createTicket({
        id: "ticket-2",
        licensePlate: "XYZ-789",
        slotNumber: "202",
      }),
      createTicket({
        id: "ticket-3",
        licensePlate: undefined,
        slotNumber: "303",
      }),
    ];

    it("should return all tickets when query is empty or whitespace", () => {
      expect(filterActiveTicketsByQuery(tickets, "   ")).toEqual(tickets);
    });

    it("should match tickets by case-insensitive license plate substring", () => {
      expect(
        filterActiveTicketsByQuery(tickets, "abc").map((ticket) => ticket.id)
      ).toEqual(["ticket-1"]);
    });

    it("should match tickets by slot number substring including unplated tickets", () => {
      expect(
        filterActiveTicketsByQuery(tickets, "303").map((ticket) => ticket.id)
      ).toEqual(["ticket-3"]);
    });

    it("should return empty array when no ticket matches", () => {
      expect(filterActiveTicketsByQuery(tickets, "ZZZ")).toEqual([]);
    });
  });

  describe("findCheckoutTicketMatch", () => {
    const tickets = [
      createTicket({
        id: "ticket-1",
        licensePlate: "ABC-100",
        slotNumber: "10",
      }),
      createTicket({
        id: "ticket-2",
        licensePlate: "ABC-200",
        slotNumber: "101",
      }),
      createTicket({
        id: "ticket-3",
        licensePlate: "EXP123",
        slotNumber: "105",
      }),
    ];

    it("should return empty status when query is blank", () => {
      expect(findCheckoutTicketMatch(tickets, "   ")).toEqual({
        status: "empty",
      });
    });

    it("should return matched when a single ticket matches by hyphen-normalized plate", () => {
      expect(findCheckoutTicketMatch(tickets, "EXP-123")).toEqual({
        status: "matched",
        ticket: tickets[2],
      });
    });

    it("should disambiguate multiple substring matches when an exact match exists", () => {
      expect(findCheckoutTicketMatch(tickets, "10")).toEqual({
        status: "matched",
        ticket: tickets[0],
      });
    });

    it("should disambiguate multiple matches using exact normalized plate when query length >= 3", () => {
      const overlappingTickets = [
        createTicket({
          id: "ticket-a",
          licensePlate: "ABC-123",
          slotNumber: "1",
        }),
        createTicket({
          id: "ticket-b",
          licensePlate: "ABC-1234",
          slotNumber: "2",
        }),
      ];

      expect(findCheckoutTicketMatch(overlappingTickets, "abc123")).toEqual({
        status: "matched",
        ticket: overlappingTickets[0],
      });
    });

    it("should return multiple when several tickets match without exact disambiguation", () => {
      expect(findCheckoutTicketMatch(tickets, "ABC")).toEqual({
        status: "multiple",
      });
    });

    it("should return none when no tickets match", () => {
      expect(findCheckoutTicketMatch(tickets, "ZZZZZZ")).toEqual({
        status: "none",
      });
    });
  });

  describe("findTicketByScannedQr", () => {
    const tickets = [
      createTicket({ id: "ticket-qr-1", licensePlate: "XYZ-789" }),
      createTicket({ id: "ticket-qr-2", licensePlate: undefined }),
    ];

    it("should match by ticketId first when present", () => {
      expect(
        findTicketByScannedQr(tickets, { ticketId: "ticket-qr-2" })
      ).toEqual(tickets[1]);
    });

    it("should fall back to normalized plate match when ticketId is missing or unmatched", () => {
      expect(
        findTicketByScannedQr(tickets, {
          plate: "xyz789",
          ticketId: "unknown-id",
        })
      ).toEqual(tickets[0]);
    });

    it("should return null when neither ticketId nor plate matches", () => {
      expect(
        findTicketByScannedQr(tickets, {
          plate: "NOPE-000",
          ticketId: "missing",
        })
      ).toBeNull();
    });
  });

  describe("buildQrNotFoundIdentifier", () => {
    const toastsTexts = APP_TEXTS.operations.toasts;

    it("should format truncated ticketId when ticketId is provided", () => {
      expect(
        buildQrNotFoundIdentifier({ ticketId: "missing-99999999" }, toastsTexts)
      ).toBe("Ticket #missing-");
    });

    it("should format plate when only plate is provided", () => {
      expect(buildQrNotFoundIdentifier({ plate: "XYZ-789" }, toastsTexts)).toBe(
        "Placa XYZ-789"
      );
    });

    it("should return fallback label when neither ticketId nor plate is provided", () => {
      expect(buildQrNotFoundIdentifier({}, toastsTexts)).toBe(
        toastsTexts.qrScannedFallback
      );
    });
  });

  describe("resolveExpressVehicleType", () => {
    it("should force the sole configured vehicle type when only one exists", () => {
      expect(resolveExpressVehicleType(["MOTORCYCLE"], "CAR")).toBe(
        "MOTORCYCLE"
      );
    });

    it("should preserve previous selection when still supported or types are empty", () => {
      expect(
        resolveExpressVehicleType(["CAR", "MOTORCYCLE"], "MOTORCYCLE")
      ).toBe("MOTORCYCLE");
      expect(resolveExpressVehicleType([], "BIKE")).toBe("BIKE");
    });

    it("should fall back to first type or CAR when previous is absent or unsupported", () => {
      expect(resolveExpressVehicleType(["BIKE", "MOTORCYCLE"], "CAR")).toBe(
        "BIKE"
      );
      expect(resolveExpressVehicleType([], undefined)).toBe("CAR");
    });
  });

  describe("validateExpressCheckIn", () => {
    const slots = [
      createSlot({ id: "slot-car", status: "AVAILABLE", type: "CAR" }),
      createSlot({ id: "slot-moto", status: "OCCUPIED", type: "MOTORCYCLE" }),
    ];

    it("should return invalidPlate when normalized plate length is outside 3..7", () => {
      expect(validateExpressCheckIn(slots, "AB", "CAR")).toEqual({
        status: "invalidPlate",
      });
      expect(validateExpressCheckIn(slots, "ABCDEFGH", "CAR")).toEqual({
        status: "invalidPlate",
      });
    });

    it("should return noSlot when no available slot exists for target vehicle type", () => {
      expect(validateExpressCheckIn(slots, "ABC-123", "MOTORCYCLE")).toEqual({
        status: "noSlot",
        vehicleType: "MOTORCYCLE",
      });
    });

    it("should return ready with normalized plate and first available slot", () => {
      expect(validateExpressCheckIn(slots, "abc-123", "CAR")).toEqual({
        cleanPlate: "ABC123",
        slot: slots[0],
        status: "ready",
      });
    });
  });
});
