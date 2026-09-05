import type { SlotStatus, SlotSummary } from "@core/models/slot.model";

import {
  getDeleteModalCopy,
  getHistoryCopy,
  getStatusModalCopy,
  getStatusTransitionOptions,
  requiresDeleteConfirm,
  VALID_STATUS_TRANSITIONS,
} from "./parking-slots-list.facade";

describe("ParkingSlotsListFacade pure functions", () => {
  describe("getDeleteModalCopy", () => {
    it("should return default message when slot is null", () => {
      const result = getDeleteModalCopy(null, "single");
      expect(result).toBe("Seleccioná una plaza para eliminar.");
    });

    it("should return batch message for batch scope", () => {
      const slot: SlotSummary = {
        id: "1",
        parkingName: "P",
        prefix: "A",
        slotNumber: "001",
        status: "AVAILABLE",
        type: "CAR",
        zone: "Z",
      };
      const result = getDeleteModalCopy(slot, "batch");
      expect(result).toBe(
        "Hay plazas seleccionadas. Debés confirmar para continuar."
      );
    });

    it("should return simple delete message when no history", () => {
      const slot: SlotSummary = {
        hasHistory: false,
        id: "1",
        parkingName: "P",
        prefix: "A",
        slotNumber: "001",
        status: "AVAILABLE",
        type: "CAR",
        zone: "Z",
      };
      const result = getDeleteModalCopy(slot, "single");
      expect(result).toBe(
        "¿Eliminar la plaza 001? Esta acción no se puede deshacer."
      );
    });

    it("should include history warning when slot has history", () => {
      const slot: SlotSummary = {
        hasHistory: true,
        id: "1",
        parkingName: "P",
        prefix: "A",
        slotNumber: "001",
        status: "AVAILABLE",
        type: "CAR",
        zone: "Z",
      };
      const result = getDeleteModalCopy(slot, "single");
      expect(result).toContain("historial de tickets");
      expect(result).toContain("001");
    });
  });

  describe("requiresDeleteConfirm", () => {
    it("should not require confirmation when no history", () => {
      const slot: SlotSummary = {
        hasHistory: false,
        id: "1",
        parkingName: "P",
        prefix: "A",
        slotNumber: "001",
        status: "AVAILABLE",
        type: "CAR",
        zone: "Z",
      };
      expect(requiresDeleteConfirm(slot)).toBe(false);
    });

    it("should require confirmation when has history", () => {
      const slot: SlotSummary = {
        hasHistory: true,
        id: "1",
        parkingName: "P",
        prefix: "B",
        slotNumber: "002",
        status: "OCCUPIED",
        type: "MOTORCYCLE",
        zone: "Z",
      };
      expect(requiresDeleteConfirm(slot)).toBe(true);
    });

    it("should require confirmation when hasHistory is undefined (safety)", () => {
      const slot: SlotSummary = {
        id: "1",
        parkingName: "P",
        prefix: "C",
        slotNumber: "003",
        status: "MAINTENANCE",
        type: "CAR",
        zone: "Z",
      };
      expect(requiresDeleteConfirm(slot)).toBe(true);
    });

    it("should return false for null", () => {
      expect(requiresDeleteConfirm(null)).toBe(false);
    });
  });

  describe("getStatusTransitionOptions", () => {
    it("should return valid transitions for AVAILABLE", () => {
      const result = getStatusTransitionOptions("AVAILABLE");
      expect(result).toEqual(["OCCUPIED", "MAINTENANCE", "RESERVED"]);
    });

    it("should return valid transitions for OCCUPIED", () => {
      const result = getStatusTransitionOptions("OCCUPIED");
      expect(result).toEqual(["AVAILABLE", "MAINTENANCE"]);
    });

    it("should return valid transitions for MAINTENANCE", () => {
      const result = getStatusTransitionOptions("MAINTENANCE");
      expect(result).toEqual(["AVAILABLE"]);
    });

    it("should return valid transitions for RESERVED", () => {
      const result = getStatusTransitionOptions("RESERVED");
      expect(result).toEqual(["AVAILABLE", "OCCUPIED"]);
    });

    it("should return empty array for unknown status", () => {
      /* SAFETY: Testing fallback behavior for runtime values outside SlotStatus union */
      const result = getStatusTransitionOptions("UNKNOWN" as SlotStatus);
      expect(result).toEqual([]);
    });
  });

  describe("getStatusModalCopy", () => {
    it("should return normal copy for standard transition", () => {
      const result = getStatusModalCopy("AVAILABLE", "OCCUPIED", false);
      expect(result.title).toBe("Cambiar estado");
      expect(result.body).toBe(
        "¿Confirmar cambio de estado de AVAILABLE a OCCUPIED?"
      );
      expect(result.requiresExtraConfirm).toBe(false);
    });

    it("should require extra confirm for occupied to available with active ticket", () => {
      const result = getStatusModalCopy("OCCUPIED", "AVAILABLE", true);
      expect(result.title).toBe("Cambiar estado");
      expect(result.body).toContain("ticket activo");
      expect(result.requiresExtraConfirm).toBe(true);
    });

    it("should not require extra confirm for occupied to available without ticket", () => {
      const result = getStatusModalCopy("OCCUPIED", "AVAILABLE", false);
      expect(result.requiresExtraConfirm).toBe(false);
    });
  });

  describe("VALID_STATUS_TRANSITIONS", () => {
    it("should define transitions for all statuses", () => {
      const statuses: (keyof typeof VALID_STATUS_TRANSITIONS)[] = [
        "AVAILABLE",
        "OCCUPIED",
        "MAINTENANCE",
        "RESERVED",
      ];
      for (const status of statuses) {
        expect(VALID_STATUS_TRANSITIONS[status]).toBeDefined();
      }
    });
  });

  describe("getHistoryCopy", () => {
    it("should return empty state when no history", () => {
      const slot: SlotSummary = {
        hasHistory: false,
        id: "1",
        parkingName: "P",
        prefix: "A",
        slotNumber: "001",
        status: "AVAILABLE",
        type: "CAR",
        zone: "Z",
      };
      const result = getHistoryCopy(slot);
      expect(result.empty).toBe(true);
      expect(result.message).toContain("Sin historial");
    });

    it("should return unavailable state when has history but no details", () => {
      const slot: SlotSummary = {
        hasHistory: true,
        id: "1",
        parkingName: "P",
        prefix: "B",
        slotNumber: "002",
        status: "OCCUPIED",
        type: "MOTORCYCLE",
        zone: "Z",
      };
      const result = getHistoryCopy(slot);
      expect(result.empty).toBe(false);
      expect(result.title).toContain("tickets previos");
    });

    it("should return empty state for null slot", () => {
      const result = getHistoryCopy(null);
      expect(result.empty).toBe(true);
    });
  });
});
