import type { PlateCountry } from "@core/models/ticket.model";

export interface FormatPlateOptions {
  country?: PlateCountry | "AUTO" | null;
  isUnplated?: boolean | null;
  fallback?: string;
}

export const UNPLATED_KEYWORDS = [
  "SIN PLACA",
  "SIN-PLACA",
  "SINPLACA",
  "",
] as const;

export type UnplatedKeyword = (typeof UNPLATED_KEYWORDS)[number];

const UNPLATED_SET = new Set<string>(UNPLATED_KEYWORDS);

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
  if (UNPLATED_SET.has(trimmed) || trimmed.startsWith("SP-")) {
    return true;
  }
  return /^SP\d+$/u.test(normalizeRawPlate(plate));
};

/**
 * Detects the plate registration country based on plate pattern and prefixes.
 * Throws Error if the plate format or length is invalid.
 */
export const detectPlateCountry = (plate?: string | null): PlateCountry => {
  if (isUnplatedPlate(plate)) {
    return "UNPLATED";
  }

  const raw = normalizeRawPlate(plate);

  // Venezuelan: 7 chars (2 letters, 3 digits, 2 letters)
  if (raw.length === 7 && /^[A-Z]{2}\d{3}[A-Z]{2}$/u.test(raw)) {
    return "VE";
  }

  // Progressive Venezuelan typing: 3rd char is digit (e.g. AB1, AB12, AB123)
  if (
    raw.length >= 3 &&
    raw.length <= 7 &&
    /\d/u.test(raw[2]) &&
    /^[A-Z]{2}\d/u.test(raw)
  ) {
    return "VE";
  }

  // Colombian: 6 chars car (3 letters, 3 digits) or moto (3 letters, 2 digits, 1 letter)
  if (
    raw.length === 6 &&
    (/^[A-Z]{3}\d{3}$/u.test(raw) || /^[A-Z]{3}\d{2}[A-Z]$/u.test(raw))
  ) {
    return "CO";
  }

  // Progressive Colombian typing: 1 or 2 letters before 3rd char is known
  if (raw.length > 0 && raw.length <= 2 && /^[A-Z]+$/u.test(raw)) {
    return "CO";
  }

  // Progressive Colombian typing: 3 to 5 chars starting with 3 letters
  if (raw.length >= 3 && raw.length < 6 && /^[A-Z]{3}/u.test(raw)) {
    return "CO";
  }

  throw new Error(`Placa inválida: formato no reconocido para "${plate}"`);
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
  const upper = trimmed.toUpperCase();
  if (!trimmed || UNPLATED_SET.has(upper)) {
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

interface ResolvedPlateOptions {
  effectiveCountry: PlateCountry | "AUTO";
  explicitUnplated: boolean | null;
  fallback: string;
}

const resolveFormatOptions = (
  countryOrOptions?: PlateCountry | "AUTO" | FormatPlateOptions | null,
  isUnplated?: boolean
): ResolvedPlateOptions => {
  let effectiveCountry: PlateCountry | "AUTO" = "AUTO";
  let explicitUnplated: boolean | null = isUnplated ?? null;
  let fallback = "SIN PLACA";

  if (
    countryOrOptions === "CO" ||
    countryOrOptions === "VE" ||
    countryOrOptions === "UNPLATED" ||
    countryOrOptions === "AUTO"
  ) {
    effectiveCountry = countryOrOptions;
  } else if (countryOrOptions) {
    effectiveCountry = countryOrOptions.country ?? "AUTO";
    explicitUnplated = isUnplated ?? countryOrOptions.isUnplated ?? null;
    fallback = countryOrOptions.fallback ?? fallback;
  }

  return { effectiveCountry, explicitUnplated, fallback };
};

const formatAutoPlate = (
  plate?: string | null,
  fallback = "SIN PLACA"
): string => {
  if (isUnplatedPlate(plate)) {
    return formatUnplated(plate, fallback);
  }
  let detected: PlateCountry;
  try {
    detected = detectPlateCountry(plate);
  } catch {
    const rawFallback = normalizeRawPlate(plate);
    detected =
      rawFallback.length >= 3 && /\d/u.test(rawFallback[2]) ? "VE" : "CO";
  }
  if (detected === "UNPLATED") {
    return formatUnplated(plate, fallback);
  }
  const raw = normalizeRawPlate(plate);
  return detected === "VE" ? formatVenezuelan(raw) : formatColombian(raw);
};

/**
 * Formats a license plate string according to country or options.
 */
export const formatPlate = (
  plate?: string | null,
  countryOrOptions?: PlateCountry | "AUTO" | FormatPlateOptions | null,
  isUnplated?: boolean
): string => {
  const { effectiveCountry, explicitUnplated, fallback } = resolveFormatOptions(
    countryOrOptions,
    isUnplated
  );

  if (explicitUnplated === true || effectiveCountry === "UNPLATED") {
    return formatUnplated(plate, fallback);
  }

  if (effectiveCountry === "AUTO") {
    return formatAutoPlate(plate, fallback);
  }

  const raw = normalizeRawPlate(plate);
  return effectiveCountry === "VE"
    ? formatVenezuelan(raw)
    : formatColombian(raw);
};

export const PlateFormatter = {
  detectCountry: detectPlateCountry,
  format: formatPlate,
  isUnplated: isUnplatedPlate,
  normalizeRaw: normalizeRawPlate,
} as const;
