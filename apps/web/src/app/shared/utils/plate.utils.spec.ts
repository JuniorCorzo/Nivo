import {
  PlateFormatter,
  detectPlateCountry,
  formatPlate,
  isUnplatedPlate,
  normalizeRawPlate,
} from "./plate.utils";
import type { FormatPlateOptions } from "./plate.utils";

describe("plate.utils", () => {
  describe("normalizeRawPlate", () => {
    it("should return empty string for null, undefined, or empty values", () => {
      expect(normalizeRawPlate(null)).toBe("");
      expect(normalizeRawPlate()).toBe("");
      expect(normalizeRawPlate("")).toBe("");
    });

    it("should strip spaces, hyphens, and special characters", () => {
      expect(normalizeRawPlate("  abc - 123  ")).toBe("ABC123");
      expect(normalizeRawPlate("a.b-c 1@2#3")).toBe("ABC123");
      expect(normalizeRawPlate("ab-123-cd")).toBe("AB123CD");
    });

    it("should convert characters to uppercase", () => {
      expect(normalizeRawPlate("abc12d")).toBe("ABC12D");
      expect(normalizeRawPlate("sp-1001")).toBe("SP1001");
    });
  });

  describe("detectPlateCountry", () => {
    it("should detect UNPLATED for empty, null, undefined, or sin placa strings", () => {
      expect(detectPlateCountry(null)).toBe("UNPLATED");
      expect(detectPlateCountry()).toBe("UNPLATED");
      expect(detectPlateCountry("")).toBe("UNPLATED");
      expect(detectPlateCountry("   ")).toBe("UNPLATED");
      expect(detectPlateCountry("SIN PLACA")).toBe("UNPLATED");
      expect(detectPlateCountry("sin-placa")).toBe("UNPLATED");
      expect(detectPlateCountry("SINPLACA")).toBe("UNPLATED");
    });

    it("should detect UNPLATED for SP prefixed strings or sequence", () => {
      expect(detectPlateCountry("SP-1001")).toBe("UNPLATED");
      expect(detectPlateCountry("sp1001")).toBe("UNPLATED");
      expect(detectPlateCountry("SP-002")).toBe("UNPLATED");
    });

    it("should detect VE for 7 characters Venezuelan format (2 letters, 3 digits, 2 letters)", () => {
      expect(detectPlateCountry("AB123CD")).toBe("VE");
      expect(detectPlateCountry("ab-123-cd")).toBe("VE");
      expect(detectPlateCountry("XY999ZZ")).toBe("VE");
    });

    it("should detect VE when 3rd char is a digit in progressive or partial plates", () => {
      expect(detectPlateCountry("AB123")).toBe("VE");
      expect(detectPlateCountry("AB1")).toBe("VE");
    });

    it("should detect CO for 6 characters Colombian car (3 letters, 3 digits) or moto (3 letters, 2 digits, 1 letter)", () => {
      expect(detectPlateCountry("ABC123")).toBe("CO");
      expect(detectPlateCountry("abc-123")).toBe("CO");
      expect(detectPlateCountry("ABC12D")).toBe("CO");
      expect(detectPlateCountry("abc-12d")).toBe("CO");
    });

    it("should default to CO if ambiguous or fewer than 3 characters", () => {
      expect(detectPlateCountry("AB")).toBe("CO");
      expect(detectPlateCountry("A")).toBe("CO");
      expect(detectPlateCountry("ABCD1234")).toBe("CO");
    });
  });

  describe("isUnplatedPlate", () => {
    it("should return true when country is UNPLATED", () => {
      expect(isUnplatedPlate("ANYTHING", "UNPLATED")).toBe(true);
      expect(isUnplatedPlate(null, "UNPLATED")).toBe(true);
    });

    it("should return true for null, undefined, or empty plates regardless of country", () => {
      expect(isUnplatedPlate(null)).toBe(true);
      expect(isUnplatedPlate()).toBe(true);
      expect(isUnplatedPlate("")).toBe(true);
      expect(isUnplatedPlate("   ")).toBe(true);
    });

    it("should return true for sin placa strings", () => {
      expect(isUnplatedPlate("SIN PLACA")).toBe(true);
      expect(isUnplatedPlate("sin-placa")).toBe(true);
      expect(isUnplatedPlate("SINPLACA")).toBe(true);
    });

    it("should return true for plates starting with SP- or SP followed by numbers", () => {
      expect(isUnplatedPlate("SP-1001")).toBe(true);
      expect(isUnplatedPlate("sp-500")).toBe(true);
      expect(isUnplatedPlate("SP1001")).toBe(true);
    });

    it("should return false for standard plated vehicles", () => {
      expect(isUnplatedPlate("ABC123", "CO")).toBe(false);
      expect(isUnplatedPlate("ABC-123")).toBe(false);
      expect(isUnplatedPlate("AB-123-CD", "VE")).toBe(false);
    });
  });

  describe("formatPlate", () => {
    describe("UNPLATED mode", () => {
      it("should return fallback ('SIN PLACA' by default) when plate is empty or sin placa", () => {
        expect(formatPlate(null, "UNPLATED")).toBe("SIN PLACA");
        expect(formatPlate(null, "UNPLATED")).toBe("SIN PLACA");
        expect(formatPlate("", "UNPLATED")).toBe("SIN PLACA");
        expect(formatPlate("SIN PLACA", "UNPLATED")).toBe("SIN PLACA");
        expect(formatPlate("sin-placa", "UNPLATED")).toBe("SIN PLACA");
        expect(formatPlate("SINPLACA", "UNPLATED")).toBe("SIN PLACA");
      });

      it("should return custom fallback when provided via options", () => {
        const options: FormatPlateOptions = {
          country: "UNPLATED",
          fallback: "NO_PLATE",
        };
        expect(formatPlate(null, options)).toBe("NO_PLATE");
        expect(formatPlate("", options)).toBe("NO_PLATE");
      });

      it("should format sequence number with SP- prefix", () => {
        expect(formatPlate("1001", "UNPLATED")).toBe("SP-1001");
        expect(formatPlate("SP-1001", "UNPLATED")).toBe("SP-1001");
        expect(formatPlate("sp1001", "UNPLATED")).toBe("SP-1001");
        expect(formatPlate("SP 55", "UNPLATED")).toBe("SP-55");
      });

      it("should respect isUnplated boolean flag as third param or in options", () => {
        expect(formatPlate("1001", "CO", true)).toBe("SP-1001");
        expect(formatPlate("1001", { country: "CO", isUnplated: true })).toBe(
          "SP-1001"
        );
        expect(formatPlate(null, { isUnplated: true })).toBe("SIN PLACA");
      });
    });

    describe("Colombian format (CO)", () => {
      it("should format standard 6-character car plate", () => {
        expect(formatPlate("abc123", "CO")).toBe("ABC-123");
        expect(formatPlate("ABC123", "CO")).toBe("ABC-123");
        expect(formatPlate("a-b-c 1 2 3", "CO")).toBe("ABC-123");
      });

      it("should format motorcycle plate (AAA-00A)", () => {
        expect(formatPlate("abc12d", "CO")).toBe("ABC-12D");
        expect(formatPlate("XYZ99W", "CO")).toBe("XYZ-99W");
      });

      it("should return uppercase without hyphen if 3 or fewer characters", () => {
        expect(formatPlate("a", "CO")).toBe("A");
        expect(formatPlate("ab", "CO")).toBe("AB");
        expect(formatPlate("abc", "CO")).toBe("ABC");
      });

      it("should progressively format partial plates", () => {
        expect(formatPlate("abc1", "CO")).toBe("ABC-1");
        expect(formatPlate("abc12", "CO")).toBe("ABC-12");
      });

      it("should truncate characters beyond 6", () => {
        expect(formatPlate("abc123456", "CO")).toBe("ABC-123");
      });
    });

    describe("Venezuelan format (VE)", () => {
      it("should format standard 7-character plate to AA-000-AA", () => {
        expect(formatPlate("ab123cd", "VE")).toBe("AB-123-CD");
        expect(formatPlate("AB123CD", "VE")).toBe("AB-123-CD");
        expect(formatPlate("a.b-1 2 3-c d", "VE")).toBe("AB-123-CD");
      });

      it("should format progressively based on length", () => {
        expect(formatPlate("a", "VE")).toBe("A");
        expect(formatPlate("ab", "VE")).toBe("AB");
        expect(formatPlate("ab1", "VE")).toBe("AB-1");
        expect(formatPlate("ab12", "VE")).toBe("AB-12");
        expect(formatPlate("ab123", "VE")).toBe("AB-123");
        expect(formatPlate("ab123c", "VE")).toBe("AB-123-C");
        expect(formatPlate("ab123cd", "VE")).toBe("AB-123-CD");
      });

      it("should truncate characters beyond 7", () => {
        expect(formatPlate("ab123cd99", "VE")).toBe("AB-123-CD");
      });
    });

    describe("AUTO detection mode", () => {
      it("should auto-detect and format Colombian plates", () => {
        expect(formatPlate("abc123", "AUTO")).toBe("ABC-123");
        expect(formatPlate("abc12d", "AUTO")).toBe("ABC-12D");
        expect(formatPlate("abc", "AUTO")).toBe("ABC");
      });

      it("should auto-detect and format Venezuelan plates", () => {
        expect(formatPlate("ab123cd", "AUTO")).toBe("AB-123-CD");
        expect(formatPlate("ab123", "AUTO")).toBe("AB-123");
      });

      it("should auto-detect unplated strings and format them", () => {
        expect(formatPlate("SP-1001", "AUTO")).toBe("SP-1001");
        expect(formatPlate("sp1001", "AUTO")).toBe("SP-1001");
        expect(formatPlate("SIN PLACA", "AUTO")).toBe("SIN PLACA");
        expect(formatPlate(null, "AUTO")).toBe("SIN PLACA");
      });

      it("should default to AUTO when country is omitted", () => {
        expect(formatPlate("abc123")).toBe("ABC-123");
        expect(formatPlate("ab123cd")).toBe("AB-123-CD");
        expect(formatPlate("sp1001")).toBe("SP-1001");
        expect(formatPlate(null)).toBe("SIN PLACA");
      });
    });
  });

  describe("PlateFormatter object wrapper", () => {
    it("should expose all functions on PlateFormatter namespace", () => {
      expect(PlateFormatter.format("abc123")).toBe("ABC-123");
      expect(PlateFormatter.normalizeRaw(" a-b c ")).toBe("ABC");
      expect(PlateFormatter.detectCountry("ab123cd")).toBe("VE");
      expect(PlateFormatter.isUnplated("SP-1001")).toBe(true);
    });
  });
});
