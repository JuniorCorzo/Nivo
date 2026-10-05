export const formatPrice = (
  price?: number | null,
  locale = "es-CO"
): string => {
  if (
    price === null ||
    price === undefined ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return "-";
  }

  return `$ ${new Intl.NumberFormat(locale).format(price)}`;
};

export const PriceConverter = {
  formatPrice,
} as const;
