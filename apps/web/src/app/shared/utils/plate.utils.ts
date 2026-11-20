import type { PlateCountry } from "@core/models/ticket.model";

export type PlatedCountry = Exclude<PlateCountry, "UNPLATED">;
export type PlateCountryMode = PlateCountry | "AUTO";

const PLATE_COUNTRIES = ["CO", "VE", "UNPLATED"] as const;
const PLATE_COUNTRY_MODES = ["CO", "VE", "UNPLATED", "AUTO"] as const;

const PLATE_COUNTRY_SET = new Set<string>(PLATE_COUNTRIES);
const PLATE_COUNTRY_MODE_SET = new Set<string>(PLATE_COUNTRY_MODES);

export const isPlateCountry = (value: unknown): value is PlateCountry =>
  typeof value === "string" && PLATE_COUNTRY_SET.has(value);

export const isPlateCountryMode = (value: unknown): value is PlateCountryMode =>
  typeof value === "string" && PLATE_COUNTRY_MODE_SET.has(value);

export interface FormatPlateOptions {
  country?: PlateCountryMode | null;
  isUnplated?: boolean | null;
  fallback?: string;
}

export interface PlateStateSpec {
  readonly country: PlateCountry;
  readonly maxRawLength: number;
  readonly maxFormattedLength: number;
  readonly progressivePattern: RegExp;
  readonly completePattern: RegExp;
  readonly format: (plateOrRaw: string, fallback?: string) => string;
  readonly validate: (raw: string, hasPhoto?: boolean) => boolean;
}

const UNPLATED_KEYWORDS = ["SIN PLACA", "SIN-PLACA", "SINPLACA", ""] as const;

const UNPLATED_SET = new Set<string>(UNPLATED_KEYWORDS);

const CO_PROGRESSIVE_REGEX = /^(?:[A-Z]{1,2}|[A-Z]{3}(?:\d|\d{2}[\dA-Z]?)?)$/u;
const CO_COMPLETE_REGEX = /^[A-Z]{3}\d{2}[\dA-Z]$/u;
const CO_MOTO_REGEX = /^[A-Z]{3}\d{2}[A-Z]$/u;
const VE_PROGRESSIVE_REGEX = /^[A-Z]{2}\d{1,3}[A-Z]{0,2}$/u;
const VE_COMPLETE_REGEX = /^[A-Z]{2}\d{3}[A-Z]{2}$/u;

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
 * Returns true when the normalized plate matches Colombian motorcycle format (AAA00A).
 */
export const isColombianMotoPlate = (plate?: string | null): boolean =>
  CO_MOTO_REGEX.test(normalizeRawPlate(plate));

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
 * Formats a raw alphanumeric string into Colombian vehicle format (AAA-000 or AAA-00A).
 */
const formatColombian = (rawPlate: string): string => {
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
const formatVenezuelan = (rawPlate: string): string => {
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
  const spMatch = upper.match(/^(?:SP[- ]?)?(?<sequence>\d+)$/u);
  if (spMatch?.groups?.["sequence"]) {
    return `SP-${spMatch.groups["sequence"]}`;
  }

  if (upper.startsWith("SP-")) {
    return `SP-${upper.slice(3).trim()}`;
  }

  return trimmed;
};

export const PLATE_STATE_MACHINE = {
  CO: {
    completePattern: CO_COMPLETE_REGEX,
    country: "CO",
    format: (plateOrRaw) => formatColombian(normalizeRawPlate(plateOrRaw)),
    maxFormattedLength: 7,
    maxRawLength: 6,
    progressivePattern: CO_PROGRESSIVE_REGEX,
    validate: (raw) => raw.length === 6,
  },
  UNPLATED: {
    completePattern: /^SP\d+$/u,
    country: "UNPLATED",
    format: (plateOrRaw, fallback = "SIN PLACA") =>
      formatUnplated(plateOrRaw, fallback),
    maxFormattedLength: 15,
    maxRawLength: 15,
    progressivePattern: /^SP\d+$/u,
    validate: (_raw, hasPhoto = false) => hasPhoto,
  },
  VE: {
    completePattern: VE_COMPLETE_REGEX,
    country: "VE",
    format: (plateOrRaw) => formatVenezuelan(normalizeRawPlate(plateOrRaw)),
    maxFormattedLength: 9,
    maxRawLength: 7,
    progressivePattern: VE_PROGRESSIVE_REGEX,
    validate: (raw) => VE_COMPLETE_REGEX.test(raw),
  },
} as const satisfies Readonly<Record<PlateCountry, PlateStateSpec>>;

const PLATED_DETECTION_STATES: readonly PlateStateSpec[] = [
  PLATE_STATE_MACHINE.VE,
  PLATE_STATE_MACHINE.CO,
];

/**
 * Detects the plate registration country based on state-machine patterns.
 * Throws Error if the plate format or length is invalid.
 */
export const detectPlateCountry = (plate?: string | null): PlateCountry => {
  if (isUnplatedPlate(plate)) {
    return "UNPLATED";
  }

  const raw = normalizeRawPlate(plate);
  const matched = PLATED_DETECTION_STATES.find((state) =>
    state.progressivePattern.test(raw)
  );
  if (matched) {
    return matched.country;
  }

  throw new Error(`Placa inválida: formato no reconocido para "${plate}"`);
};

/**
 * Deterministic non-throwing transition between plated states ('CO' | 'VE').
 * 3rd character digit -> 'VE'; otherwise -> 'CO'.
 */
export const resolvePlatedCountry = (
  plate?: string | null,
  mode: PlateCountryMode = "AUTO"
): PlatedCountry => {
  if (mode === "CO" || mode === "VE") {
    return mode;
  }
  const raw = normalizeRawPlate(plate);
  return raw.length >= 3 && /\d/u.test(raw[2]) ? "VE" : "CO";
};

/**
 * Resolves target PlateCountry state ('CO' | 'VE' | 'UNPLATED') without throwing.
 */
export const resolvePlateCountry = (
  plate?: string | null,
  mode: PlateCountryMode = "AUTO",
  explicitUnplated?: boolean | null
): PlateCountry => {
  if (explicitUnplated || mode === "UNPLATED") {
    return "UNPLATED";
  }
  if (mode === "CO" || mode === "VE") {
    return mode;
  }
  if (isUnplatedPlate(plate)) {
    return "UNPLATED";
  }
  return resolvePlatedCountry(plate, mode);
};

interface ResolvedPlateOptions {
  effectiveCountry: PlateCountryMode;
  explicitUnplated: boolean | null;
  fallback: string;
}

const resolveFormatOptions = (
  countryOrOptions?: PlateCountryMode | FormatPlateOptions | null,
  isUnplated?: boolean
): ResolvedPlateOptions => {
  if (!countryOrOptions || isPlateCountryMode(countryOrOptions)) {
    return {
      effectiveCountry: countryOrOptions ?? "AUTO",
      explicitUnplated: isUnplated ?? null,
      fallback: "SIN PLACA",
    };
  }

  return {
    effectiveCountry: countryOrOptions.country ?? "AUTO",
    explicitUnplated: isUnplated ?? countryOrOptions.isUnplated ?? null,
    fallback: countryOrOptions.fallback ?? "SIN PLACA",
  };
};

/**
 * Formats a license plate string according to country state or options.
 */
export const formatPlate = (
  plate?: string | null,
  countryOrOptions?: PlateCountryMode | FormatPlateOptions | null,
  isUnplated?: boolean
): string => {
  const { effectiveCountry, explicitUnplated, fallback } = resolveFormatOptions(
    countryOrOptions,
    isUnplated
  );
  const country = resolvePlateCountry(
    plate,
    effectiveCountry,
    explicitUnplated
  );
  return PLATE_STATE_MACHINE[country].format(plate ?? "", fallback);
};

export const PlateFormatter = {
  detectCountry: detectPlateCountry,
  format: formatPlate,
  isUnplated: isUnplatedPlate,
  normalizeRaw: normalizeRawPlate,
} as const;
