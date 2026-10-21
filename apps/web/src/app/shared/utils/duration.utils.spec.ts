import {
  DURATION_UNIT_OPTIONS,
  DurationConverter,
  formatDuration,
  fromMinutes,
  toMinutes,
} from "./duration.utils";

describe("duration.utils", () => {
  describe("DURATION_UNIT_OPTIONS", () => {
    it("should provide exactly 3 options for MINUTES, HOURS, and DAYS", () => {
      expect(DURATION_UNIT_OPTIONS).toHaveLength(3);
      expect(DURATION_UNIT_OPTIONS).toEqual([
        { label: "Minutos", value: "MINUTES" },
        { label: "Horas", value: "HOURS" },
        { label: "Días", value: "DAYS" },
      ]);
    });
  });

  describe("toMinutes", () => {
    it("should convert MINUTES with 1x multiplier", () => {
      expect(toMinutes(0, "MINUTES")).toBe(0);
      expect(toMinutes(15, "MINUTES")).toBe(15);
      expect(toMinutes(45, "MINUTES")).toBe(45);
      expect(toMinutes(120, "MINUTES")).toBe(120);
    });

    it("should default to MINUTES when unit is omitted", () => {
      expect(toMinutes(15)).toBe(15);
    });

    it("should convert HOURS with 60x multiplier", () => {
      expect(toMinutes(1, "HOURS")).toBe(60);
      expect(toMinutes(2, "HOURS")).toBe(120);
      expect(toMinutes(24, "HOURS")).toBe(1440);
    });

    it("should convert DAYS with 1440x multiplier", () => {
      expect(toMinutes(1, "DAYS")).toBe(1440);
      expect(toMinutes(2, "DAYS")).toBe(2880);
      expect(toMinutes(7, "DAYS")).toBe(10_080);
    });

    it("should round fractional values to the nearest integer", () => {
      expect(toMinutes(1.5, "HOURS")).toBe(90);
      expect(toMinutes(0.5, "DAYS")).toBe(720);
      expect(toMinutes(10.4, "MINUTES")).toBe(10);
      expect(toMinutes(10.6, "MINUTES")).toBe(11);
    });

    it("should return 0 for invalid, null, undefined, NaN, or non-positive values", () => {
      expect(toMinutes(null)).toBe(0);
      expect(toMinutes()).toBe(0);
      expect(toMinutes(Number.NaN)).toBe(0);
      expect(toMinutes(-5, "MINUTES")).toBe(0);
      expect(toMinutes(-2, "HOURS")).toBe(0);
      expect(toMinutes(Number.POSITIVE_INFINITY, "HOURS")).toBe(0);
      expect(toMinutes(Number.NEGATIVE_INFINITY, "HOURS")).toBe(0);
    });
  });

  describe("fromMinutes", () => {
    it("should return 0 MINUTES for non-positive or invalid input", () => {
      expect(fromMinutes(0)).toEqual({ amount: 0, unit: "MINUTES" });
      expect(fromMinutes(-10)).toEqual({ amount: 0, unit: "MINUTES" });
      expect(fromMinutes(null)).toEqual({ amount: 0, unit: "MINUTES" });
      expect(fromMinutes()).toEqual({ amount: 0, unit: "MINUTES" });
      expect(fromMinutes(Number.NaN)).toEqual({ amount: 0, unit: "MINUTES" });
      expect(fromMinutes(Number.POSITIVE_INFINITY)).toEqual({
        amount: 0,
        unit: "MINUTES",
      });
      expect(fromMinutes(Number.NEGATIVE_INFINITY)).toEqual({
        amount: 0,
        unit: "MINUTES",
      });
    });

    it("should convert values divisible by 1440 into DAYS", () => {
      expect(fromMinutes(1440)).toEqual({ amount: 1, unit: "DAYS" });
      expect(fromMinutes(2880)).toEqual({ amount: 2, unit: "DAYS" });
      expect(fromMinutes(4320)).toEqual({ amount: 3, unit: "DAYS" });
    });

    it("should convert values divisible by 60 (and not 1440) into HOURS", () => {
      expect(fromMinutes(60)).toEqual({ amount: 1, unit: "HOURS" });
      expect(fromMinutes(120)).toEqual({ amount: 2, unit: "HOURS" });
      expect(fromMinutes(180)).toEqual({ amount: 3, unit: "HOURS" });
      expect(fromMinutes(1380)).toEqual({ amount: 23, unit: "HOURS" });
      expect(fromMinutes(1500)).toEqual({ amount: 25, unit: "HOURS" });
    });

    it("should return MINUTES for values not divisible by 60 or less than 60", () => {
      expect(fromMinutes(1)).toEqual({ amount: 1, unit: "MINUTES" });
      expect(fromMinutes(15)).toEqual({ amount: 15, unit: "MINUTES" });
      expect(fromMinutes(45)).toEqual({ amount: 45, unit: "MINUTES" });
      expect(fromMinutes(75)).toEqual({ amount: 75, unit: "MINUTES" });
      expect(fromMinutes(1441)).toEqual({ amount: 1441, unit: "MINUTES" });
    });
  });

  describe("DurationConverter object", () => {
    it("should delegate to toMinutes and fromMinutes", () => {
      expect(DurationConverter.toMinutes(2, "HOURS")).toBe(120);
      expect(DurationConverter.fromMinutes(120)).toEqual({
        amount: 2,
        unit: "HOURS",
      });
    });

    it("should perform lossless roundtrip for standard whole units", () => {
      expect(
        DurationConverter.fromMinutes(DurationConverter.toMinutes(3, "DAYS"))
      ).toEqual({
        amount: 3,
        unit: "DAYS",
      });

      expect(
        DurationConverter.fromMinutes(DurationConverter.toMinutes(4, "HOURS"))
      ).toEqual({
        amount: 4,
        unit: "HOURS",
      });

      expect(
        DurationConverter.fromMinutes(
          DurationConverter.toMinutes(25, "MINUTES")
        )
      ).toEqual({
        amount: 25,
        unit: "MINUTES",
      });
    });
  });

  describe("formatDuration", () => {
    it("should format days with singular and plural units", () => {
      expect(formatDuration(1440)).toBe("1 día");
      expect(formatDuration(2880)).toBe("2 días");
    });

    it("should format hours with singular and plural units", () => {
      expect(formatDuration(60)).toBe("1 hora");
      expect(formatDuration(120)).toBe("2 horas");
    });

    it("should format minutes", () => {
      expect(formatDuration(15)).toBe("15 min");
      expect(formatDuration(1)).toBe("1 min");
      expect(formatDuration(0)).toBe("0 min");
    });

    it("should return '-' for invalid, null, undefined, NaN, or negative values", () => {
      expect(formatDuration(null)).toBe("-");
      expect(formatDuration()).toBe("-");
      expect(formatDuration(-1)).toBe("-");
      expect(formatDuration(Number.NaN)).toBe("-");
    });

    it("should expose formatDuration on DurationConverter", () => {
      expect(DurationConverter.formatDuration(1440)).toBe("1 día");
    });
  });
});
