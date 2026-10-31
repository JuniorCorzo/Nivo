import type { PlateCountry } from "@core/models/ticket.model";

export interface FormatPlateOptions {
  country?: PlateCountry | "AUTO" | null;
  isUnplated?: boolean | null;
  fallback?: string;
}

/**
 * Strips hyphens, whitespaces, and symbols to return an uppercase alphanumeric string.
 */
export const normalizeRawPlate = (plate?: string | null): string => {
  if (!plate) {
    return "";
  }
  return plate.replaceAll(/[^A-Za-z0-9]/gu, "").toUpperCase();
};

/**
 * Returns true if the plate or country indicates an unplated vehicle.
 */
export const isUnplatedPlate = (
  plate?: string | null,
  country?: PlateCountry | null
): boolean => {
  if (country === "UNPLATED") {
    return true;
  }
  const trimmed = (plate ?? "").trim().toUpperCase();
  if (
    !trimmed ||
    trimmed === "SIN PLACA" ||
    trimmed === "SIN-PLACA" ||
    trimmed === "SINPLACA"
  ) {
    return true;
  }
  const raw = normalizeRawPlate(plate);
  if (trimmed.startsWith("SP-") || /^SP\d+$/u.test(raw)) {
    return true;
  }
  return false;
};

/**
 * Detects the plate registration country based on plate pattern and prefixes.
 */
export const detectPlateCountry = (plate?: string | null): PlateCountry => {
  const trimmed = (plate ?? "").trim().toUpperCase();
  if (
    !trimmed ||
    trimmed === "SIN PLACA" ||
    trimmed === "SIN-PLACA" ||
    trimmed === "SINPLACA"
  ) {
    return "UNPLATED";
  }
  const raw = normalizeRawPlate(plate);
  if (trimmed.startsWith("SP-") || /^SP\d+$/u.test(raw)) {
    return "UNPLATED";
  }

  // Venezuelan: 7 chars (2 letters, 3 digits, 2 letters) or progressive 3rd char digit
  if (raw.length === 7 && /^[A-Z]{2}\d{3}[A-Z]{2}$/u.test(raw)) {
    return "VE";
  }
  if (raw.length >= 3 && /\d/u.test(raw[2])) {
    return "VE";
  }

  // Colombian: 6 chars car (3 letters, 3 digits) or moto (3 letters, 2 digits, 1 letter)
  if (
    raw.length === 6 &&
    (/^[A-Z]{3}\d{3}$/u.test(raw) || /^[A-Z]{3}\d{2}[A-Z]$/u.test(raw))
  ) {
    return "CO";
  }

  return "CO";
};

/**
 * Formats a raw alphanumeric string into Colombian vehicle format (AAA-000 or AAA-00A).
 */
export const formatColombian = (rawPlate: string): string => {
  const truncated = rawPlate.slice(0, 6);
  if (truncated.length <= 3) {
    return truncated;
  }
  const letterDigitMatch = truncated.match(
    /^(?<letters>[A-Z]{2,3})(?<digits>\d+)$/u
  );
  if (letterDigitMatch?.groups) {
    return `${letterDigitMatch.groups["letters"]}-${letterDigitMatch.groups["digits"]}`;
  }
  return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
};

/**
 * Formats a raw alphanumeric string into Venezuelan vehicle format (AA-000-AA).
 */
export const formatVenezuelan = (rawPlate: string): string => {
  const truncated = rawPlate.slice(0, 7);
  if (truncated.length <= 2) {
    return truncated;
  }
  if (truncated.length <= 5) {
    return `${truncated.slice(0, 2)}-${truncated.slice(2)}`;
  }
  return `${truncated.slice(0, 2)}-${truncated.slice(2, 5)}-${truncated.slice(5)}`;
};

const formatUnplated = (
  plate?: string | null,
  fallback = "SIN PLACA"
): string => {
  const trimmed = (plate ?? "").trim();
  if (!trimmed) {
    return fallback;
  }
  const upper = trimmed.toUpperCase();
  if (upper === "SIN PLACA" || upper === "SIN-PLACA" || upper === "SINPLACA") {
    return fallback;
  }

  // Format sequence number with standard SP- prefix
  const spMatch = upper.match(/^SP[- ]?(?<sequence>\d+)$/u);
  if (spMatch?.groups?.["sequence"]) {
    return `SP-${spMatch.groups["sequence"]}`;
  }

  if (/^\d+$/u.test(trimmed)) {
    return `SP-${trimmed}`;
  }

  if (upper.startsWith("SP-")) {
    return `SP-${upper.slice(3).trim()}`;
  }

  return trimmed;
};

/**
 * Formats a license plate string according to country or options.
 */
export const formatPlate = (
  plate?: string | null,
  countryOrOptions?: PlateCountry | "AUTO" | FormatPlateOptions | null,
  isUnplated?: boolean
): string => {
  let effectiveCountry: PlateCountry | "AUTO" = "AUTO";
  let explicitUnplated: boolean | null = null;
  let fallback = "SIN PLACA";

  if (
    countryOrOptions === "CO" ||
    countryOrOptions === "VE" ||
    countryOrOptions === "UNPLATED" ||
    countryOrOptions === "AUTO"
  ) {
    effectiveCountry = countryOrOptions;
  } else if (countryOrOptions !== null && countryOrOptions !== undefined) {
    const {
      country = "AUTO",
      fallback: customFallback,
      isUnplated: optionsUnplated = null,
    } = countryOrOptions;
    effectiveCountry = country ?? "AUTO";
    explicitUnplated = optionsUnplated;
    if (customFallback !== undefined) {
      fallback = customFallback;
    }
  }

  if (isUnplated === true || isUnplated === false) {
    explicitUnplated = isUnplated;
  }

  if (explicitUnplated === true || effectiveCountry === "UNPLATED") {
    return formatUnplated(plate, fallback);
  }

  if (effectiveCountry === "AUTO") {
    if (isUnplatedPlate(plate)) {
      return formatUnplated(plate, fallback);
    }
    const detected = detectPlateCountry(plate);
    if (detected === "UNPLATED") {
      return formatUnplated(plate, fallback);
    }
    const raw = normalizeRawPlate(plate);
    return detected === "VE" ? formatVenezuelan(raw) : formatColombian(raw);
  }

  const raw = normalizeRawPlate(plate);
  if (effectiveCountry === "VE") {
    return formatVenezuelan(raw);
  }

  return formatColombian(raw);
};

export const PlateFormatter = {
  detectCountry: detectPlateCountry,
  format: formatPlate,
  isUnplated: isUnplatedPlate,
  normalizeRaw: normalizeRawPlate,
} as const;
