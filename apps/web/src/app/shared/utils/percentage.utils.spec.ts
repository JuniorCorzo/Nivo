import {
  PercentageConverter,
  formatIvaRate,
  percentageToRate,
  rateToPercentage,
} from "./percentage.utils";

describe("percentage.utils", () => {
  describe("rateToPercentage", () => {
    it("should convert decimal rate to percentage", () => {
      expect(rateToPercentage(0.19)).toBe(19);
      expect(rateToPercentage(0.05)).toBe(5);
      expect(rateToPercentage(0.5)).toBe(50);
      expect(rateToPercentage(1)).toBe(100);
      expect(rateToPercentage(0)).toBe(0);
    });

    it("should accurately handle floating point decimals without artifacts", () => {
      expect(rateToPercentage(0.165)).toBe(16.5);
      expect(rateToPercentage(0.07)).toBe(7);
      expect(rateToPercentage(0.19)).toBe(19);
    });

    it("should return 0 for non-positive or invalid input", () => {
      expect(rateToPercentage(null)).toBe(0);
      expect(rateToPercentage()).toBe(0);
      expect(rateToPercentage(Number.NaN)).toBe(0);
      expect(rateToPercentage(-0.19)).toBe(0);
      expect(rateToPercentage(Number.POSITIVE_INFINITY)).toBe(0);
      expect(rateToPercentage(Number.NEGATIVE_INFINITY)).toBe(0);
    });
  });

  describe("percentageToRate", () => {
    it("should convert percentage to decimal rate", () => {
      expect(percentageToRate(19)).toBe(0.19);
      expect(percentageToRate(5)).toBe(0.05);
      expect(percentageToRate(50)).toBe(0.5);
      expect(percentageToRate(100)).toBe(1);
      expect(percentageToRate(0)).toBe(0);
    });

    it("should accurately handle decimal percentages without artifacts", () => {
      expect(percentageToRate(16.5)).toBe(0.165);
      expect(percentageToRate(7.25)).toBe(0.0725);
    });

    it("should return 0 for non-positive or invalid input", () => {
      expect(percentageToRate(null)).toBe(0);
      expect(percentageToRate()).toBe(0);
      expect(percentageToRate(Number.NaN)).toBe(0);
      expect(percentageToRate(-10)).toBe(0);
      expect(percentageToRate(Number.POSITIVE_INFINITY)).toBe(0);
      expect(percentageToRate(Number.NEGATIVE_INFINITY)).toBe(0);
    });
  });

  describe("PercentageConverter object", () => {
    it("should delegate to rateToPercentage and percentageToRate", () => {
      expect(PercentageConverter.rateToPercentage(0.19)).toBe(19);
      expect(PercentageConverter.percentageToRate(19)).toBe(0.19);
    });

    it("should perform lossless roundtrips", () => {
      expect(
        PercentageConverter.rateToPercentage(
          PercentageConverter.percentageToRate(19)
        )
      ).toBe(19);
      expect(
        PercentageConverter.percentageToRate(
          PercentageConverter.rateToPercentage(0.19)
        )
      ).toBe(0.19);
      expect(
        PercentageConverter.rateToPercentage(
          PercentageConverter.percentageToRate(16.5)
        )
      ).toBe(16.5);
    });
  });

  describe("formatIvaRate", () => {
    it("should format decimal rate as percentage", () => {
      expect(formatIvaRate(0.19)).toBe("19%");
    });

    it("should format percentage numbers > 1 correctly", () => {
      expect(formatIvaRate(19)).toBe("19%");
    });

    it("should format 0 as 0%", () => {
      expect(formatIvaRate(0)).toBe("0%");
    });

    it("should return '-' for null, undefined, NaN, or negative values", () => {
      expect(formatIvaRate(null)).toBe("-");
      expect(formatIvaRate()).toBe("-");
      expect(formatIvaRate(Number.NaN)).toBe("-");
      expect(formatIvaRate(-0.19)).toBe("-");
    });

    it("should expose formatIvaRate on PercentageConverter", () => {
      expect(PercentageConverter.formatIvaRate(0.19)).toBe("19%");
    });
  });
});
