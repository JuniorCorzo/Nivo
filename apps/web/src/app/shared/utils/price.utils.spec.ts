import { formatPrice, PriceConverter } from "./price.utils";

describe("price.utils", () => {
  describe("formatPrice", () => {
    it("should format positive prices in COP currency format", () => {
      expect(formatPrice(5000)).toBe("$ 5.000");
      expect(formatPrice(1_000_000)).toBe("$ 1.000.000");
      expect(formatPrice(0)).toBe("$ 0");
    });

    it("should return '-' for null, undefined, NaN, or negative values", () => {
      expect(formatPrice(null)).toBe("-");
      expect(formatPrice()).toBe("-");
      expect(formatPrice(-5000)).toBe("-");
      expect(formatPrice(Number.NaN)).toBe("-");
    });

    it("should expose formatPrice on PriceConverter", () => {
      expect(PriceConverter.formatPrice(5000)).toBe("$ 5.000");
    });
  });
});
