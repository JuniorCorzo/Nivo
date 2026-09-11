export type DurationUnit = "MINUTES" | "HOURS" | "DAYS";

export interface DurationOption {
  readonly label: string;
  readonly value: DurationUnit;
}

export const DURATION_UNIT_OPTIONS: readonly DurationOption[] = [
  { label: "Minutos", value: "MINUTES" },
  { label: "Horas", value: "HOURS" },
  { label: "Días", value: "DAYS" },
] as const;

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 1440;

const UNIT_MULTIPLIERS = {
  DAYS: MINUTES_IN_DAY,
  HOURS: MINUTES_IN_HOUR,
  MINUTES: 1,
} as const satisfies Record<DurationUnit, number>;

export interface DurationValue {
  amount: number;
  unit: DurationUnit;
}

export const toMinutes = (
  amount?: number | null,
  unit: DurationUnit = "MINUTES"
): number => {
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 0;
  }

  const multiplier = UNIT_MULTIPLIERS[unit] ?? 1;
  return Math.max(0, Math.round(amount * multiplier));
};

export const fromMinutes = (
  totalMinutes?: number | null
): DurationValue => {
  if (!totalMinutes || !Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return { amount: 0, unit: "MINUTES" };
  }

  switch (true) {
    case totalMinutes >= MINUTES_IN_DAY &&
      totalMinutes % MINUTES_IN_DAY === 0: {
      return { amount: totalMinutes / MINUTES_IN_DAY, unit: "DAYS" };
    }
    case totalMinutes >= MINUTES_IN_HOUR &&
      totalMinutes % MINUTES_IN_HOUR === 0: {
      return { amount: totalMinutes / MINUTES_IN_HOUR, unit: "HOURS" };
    }
    default: {
      return { amount: totalMinutes, unit: "MINUTES" };
    }
  }
};

export const formatDuration = (totalMinutes?: number | null): string => {
  if (
    totalMinutes === null ||
    totalMinutes === undefined ||
    !Number.isFinite(totalMinutes) ||
    totalMinutes < 0
  ) {
    return "-";
  }

  if (totalMinutes === 0) {
    return "0 min";
  }

  const { amount, unit } = fromMinutes(totalMinutes);

  switch (unit) {
    case "DAYS": {
      return `${amount} ${amount === 1 ? "día" : "días"}`;
    }
    case "HOURS": {
      return `${amount} ${amount === 1 ? "hora" : "horas"}`;
    }
    default: {
      return `${amount} min`;
    }
  }
};

export const DurationConverter = {
  formatDuration,
  fromMinutes,
  toMinutes,
} as const;
