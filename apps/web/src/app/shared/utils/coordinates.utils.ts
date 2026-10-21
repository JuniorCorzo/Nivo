import type { Coordinates } from "@core/type/coordinates.type";

const DEFAULT_FRACTION_DIGITS = 4;

export const formatCoordinate = (
  coordinate?: number | null,
  locale = "es-CO"
): string | undefined => {
  if (
    coordinate === null ||
    coordinate === undefined ||
    !Number.isFinite(coordinate)
  ) {
    return undefined;
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: DEFAULT_FRACTION_DIGITS,
    minimumFractionDigits: DEFAULT_FRACTION_DIGITS,
  }).format(coordinate);
};

export const formatCoordinates = (
  coordinates?: Coordinates | null,
  separator = ", "
): string => {
  if (!coordinates) {
    return "";
  }

  const formattedLatitude = formatCoordinate(coordinates.latitude);
  const formattedLongitude = formatCoordinate(coordinates.longitude);

  if (formattedLatitude === undefined || formattedLongitude === undefined) {
    return "";
  }

  return `${formattedLatitude}${separator}${formattedLongitude}`;
};
