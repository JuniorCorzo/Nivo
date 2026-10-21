export const rateToPercentage = (rate?: number | null): number => {
  if (
    rate === null ||
    rate === undefined ||
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    return 0;
  }
  return Math.round(rate * 100 * 10_000) / 10_000;
};

export const percentageToRate = (percentage?: number | null): number => {
  if (
    percentage === null ||
    percentage === undefined ||
    !Number.isFinite(percentage) ||
    percentage <= 0
  ) {
    return 0;
  }
  return Math.round((percentage / 100) * 10_000) / 10_000;
};

export const formatIvaRate = (
  rate?: number | null,
  locale = "es-CO"
): string => {
  if (
    rate === null ||
    rate === undefined ||
    !Number.isFinite(rate) ||
    rate < 0
  ) {
    return "-";
  }

  const normalizedRate = rate > 1 ? rate / 100 : rate;
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    style: "percent",
  }).format(normalizedRate);
};

export const PercentageConverter = {
  formatIvaRate,
  percentageToRate,
  rateToPercentage,
} as const;
