import type { OperationsKpiMetrics } from "@core/models/operations-cockpit.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import {
  buildOperationsKpiVehicleCards,
  calculateOccupancyRate,
  calculateOccupiedPercentage,
} from "./kpi-ribbon.helpers";

const createMetrics = (
  overrides: Partial<OperationsKpiMetrics> = {}
): OperationsKpiMetrics => ({
  availableCarSlotsCount: 4,
  availableMotoSlotsCount: 3,
  availableSlotsCount: 7,
  occupationBarPercentage: 30,
  occupationPercentage: 30,
  occupiedSlotsCount: 3,
  totalCarSlotsCount: 6,
  totalMotoSlotsCount: 4,
  totalSlotsCount: 10,
  ...overrides,
});

describe("kpi-ribbon.helpers", () => {
  describe("calculateOccupiedPercentage", () => {
    it("should calculate occupied percentage for normal slot counts", () => {
      expect(calculateOccupiedPercentage(10, 4)).toBe(60);
      expect(calculateOccupiedPercentage(4, 3)).toBe(25);
    });

    it("should return 0 when totalSlots is 0 or negative", () => {
      expect(calculateOccupiedPercentage(0, 0)).toBe(0);
      expect(calculateOccupiedPercentage(-5, 0)).toBe(0);
    });

    it("should return 100 when availableSlots is 0", () => {
      expect(calculateOccupiedPercentage(8, 0)).toBe(100);
    });

    it("should return 0 when all slots are available", () => {
      expect(calculateOccupiedPercentage(8, 8)).toBe(0);
    });
  });

  describe("calculateOccupancyRate", () => {
    it("should calculate occupancy rate for normal counts", () => {
      expect(calculateOccupancyRate(3, 10)).toBe(30);
      expect(calculateOccupancyRate(5, 5)).toBe(100);
      expect(calculateOccupancyRate(0, 10)).toBe(0);
    });

    it("should return 0 when totalSlots is 0 or negative", () => {
      expect(calculateOccupancyRate(0, 0)).toBe(0);
      expect(calculateOccupancyRate(2, -4)).toBe(0);
    });
  });

  describe("buildOperationsKpiVehicleCards", () => {
    const texts = APP_TEXTS.operations.ribbon;

    it("should build both car and motorcycle cards when both have slots", () => {
      const cards = buildOperationsKpiVehicleCards(createMetrics(), texts);

      expect(cards).toEqual([
        {
          available: 4,
          barClass: "bg-success/80",
          icon: "lucideCar",
          iconBoxClass: "bg-success/10 text-success border-success/20",
          id: "CAR",
          label: texts.cars,
          occupiedPct: ((6 - 4) / 6) * 100,
          total: 6,
        },
        {
          available: 3,
          barClass: "bg-primary/80",
          icon: "lucideBike",
          iconBoxClass: "bg-primary/10 text-primary border-primary/20",
          id: "MOTORCYCLE",
          label: texts.motos,
          occupiedPct: 25,
          total: 4,
        },
      ]);
    });

    it("should build only car card when motorcycle slots are 0", () => {
      const cards = buildOperationsKpiVehicleCards(
        createMetrics({
          availableMotoSlotsCount: 0,
          totalMotoSlotsCount: 0,
        }),
        texts
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe("CAR");
    });

    it("should build only motorcycle card when car slots are 0", () => {
      const cards = buildOperationsKpiVehicleCards(
        createMetrics({
          availableCarSlotsCount: 0,
          totalCarSlotsCount: 0,
        }),
        texts
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe("MOTORCYCLE");
    });

    it("should return an empty array when neither cars nor motorcycles have slots", () => {
      const cards = buildOperationsKpiVehicleCards(
        createMetrics({
          availableCarSlotsCount: 0,
          availableMotoSlotsCount: 0,
          totalCarSlotsCount: 0,
          totalMotoSlotsCount: 0,
        }),
        texts
      );

      expect(cards).toEqual([]);
    });
  });
});
