import { formatCoordinate, formatCoordinates } from "./coordinates.utils";

describe("coordinates.utils", () => {
  describe("formatCoordinate", () => {
    it("should format valid coordinate with default 'es-CO' locale to 4 decimal places", () => {
      expect(formatCoordinate(4.6097)).toBe("4,6097");
      expect(formatCoordinate(-74.0817)).toBe("-74,0817");
      expect(formatCoordinate(0)).toBe("0,0000");
    });

    it("should format coordinate with custom locale", () => {
      expect(formatCoordinate(4.6097, "en-US")).toBe("4.6097");
      expect(formatCoordinate(-74.0817, "en-US")).toBe("-74.0817");
    });

    it("should pad or truncate to exactly 4 fraction digits", () => {
      expect(formatCoordinate(4.5, "es-CO")).toBe("4,5000");
      expect(formatCoordinate(4.123456, "es-CO")).toBe("4,1235");
    });

    it("should return undefined for null, undefined, NaN, or non-finite numbers", () => {
      expect(formatCoordinate(null)).toBeUndefined();
      expect(formatCoordinate()).toBeUndefined();
      expect(formatCoordinate(Number.NaN)).toBeUndefined();
      expect(formatCoordinate(Number.POSITIVE_INFINITY)).toBeUndefined();
      expect(formatCoordinate(Number.NEGATIVE_INFINITY)).toBeUndefined();
    });
  });

  describe("formatCoordinates", () => {
    it("should format coordinates object into comma-separated string", () => {
      const result = formatCoordinates({
        latitude: 4.6097,
        longitude: -74.0817,
      });
      expect(result).toBe("4,6097, -74,0817");
    });

    it("should support custom separator", () => {
      const result = formatCoordinates(
        { latitude: 4.6097, longitude: -74.0817 },
        " | "
      );
      expect(result).toBe("4,6097 | -74,0817");
    });

    it("should return empty string when coordinates is null or undefined", () => {
      expect(formatCoordinates(null)).toBe("");
      expect(formatCoordinates()).toBe("");
    });

    it("should return empty string when latitude or longitude is invalid", () => {
      expect(
        formatCoordinates({
          latitude: Number.NaN,
          longitude: -74.0817,
        })
      ).toBe("");
      expect(
        formatCoordinates({
          latitude: 4.6097,
          longitude: Number.NaN,
        })
      ).toBe("");
    });
  });
});
