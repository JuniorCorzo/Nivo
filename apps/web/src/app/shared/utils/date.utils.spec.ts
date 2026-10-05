import { DateConverter, formatDateTime } from "./date.utils";

describe("date.utils", () => {
  describe("formatDateTime", () => {
    it("should format valid ISO date strings to dd/MM/yyyy · HH:mm format", () => {
      const formatted = formatDateTime("2026-05-10T14:20:00Z");
      expect(formatted).toContain("2026");
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/u);
    });

    it("should return empty string for empty, null, or undefined values", () => {
      expect(formatDateTime("")).toBe("");
      expect(formatDateTime(null)).toBe("");
      expect(formatDateTime()).toBe("");
    });

    it("should return original string for invalid date strings", () => {
      expect(formatDateTime("invalid-date")).toBe("invalid-date");
    });

    it("should expose formatDateTime on DateConverter", () => {
      expect(DateConverter.formatDateTime("")).toBe("");
    });
  });
});
