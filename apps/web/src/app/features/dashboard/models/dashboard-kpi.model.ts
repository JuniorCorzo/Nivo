import type { DashboardSummaryModel } from "@core/models/dashboard.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export interface OccupancyKpiMetrics {
  percentage: number;
  clampedPercentage: number;
  occupiedSlots: number;
  totalCapacity: number;
  progressClass: string;
  deltaClass: string;
  deltaText: string;
}

export interface RevenueKpiMetrics {
  todayRevenue: number;
  currency: string;
  hasDigitalRatio: boolean;
  digitalPaymentRatioText: string;
  hasRevenueDelta: boolean;
  revenueDeltaText: string;
  revenueDeltaClass: string;
  revenueDeltaIcon: string;
}

export interface TicketsKpiMetrics {
  activeTickets: number;
  totalOrCompletedTickets: number;
  netFlowRateText: string;
}

export interface StayKpiMetrics {
  formattedAvgStayMinutes: number;
  formattedAvgStayHours: string;
  completedTickets: number;
  hasGracePeriod: boolean;
  gracePeriodMinutes?: number;
  hasStayDelta: boolean;
  stayDeltaText: string;
  stayDeltaClass: string;
  stayDeltaIcon: string;
}

export interface DashboardKpiMetrics {
  occupancy: OccupancyKpiMetrics;
  revenue: RevenueKpiMetrics;
  tickets: TicketsKpiMetrics;
  stay: StayKpiMetrics;
}

const buildOccupancyMetrics = (
  summary: DashboardSummaryModel | null,
  percentage: number
): OccupancyKpiMetrics => {
  const texts = APP_TEXTS.dashboard.kpis.occupancy;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  if (percentage >= 90) {
    return {
      clampedPercentage,
      deltaClass: "text-rose-400",
      deltaText: texts.critical,
      occupiedSlots: summary?.occupiedSlots ?? 0,
      percentage,
      progressClass: "bg-rose-500",
      totalCapacity: summary?.totalCapacity ?? 0,
    };
  }

  if (percentage >= 70) {
    return {
      clampedPercentage,
      deltaClass: "text-amber-400",
      deltaText: texts.alert,
      occupiedSlots: summary?.occupiedSlots ?? 0,
      percentage,
      progressClass: "bg-amber-500",
      totalCapacity: summary?.totalCapacity ?? 0,
    };
  }

  return {
    clampedPercentage,
    deltaClass: "text-emerald-400",
    deltaText: texts.normal,
    occupiedSlots: summary?.occupiedSlots ?? 0,
    percentage,
    progressClass: "bg-emerald-500",
    totalCapacity: summary?.totalCapacity ?? 0,
  };
};

const buildRevenueMetrics = (
  summary: DashboardSummaryModel | null
): RevenueKpiMetrics => {
  const delta = summary?.revenueDeltaPercentage;
  const hasRevenueDelta = delta !== undefined && delta !== null;
  const numDelta = delta ?? 0;
  const hasDigitalRatio =
    summary?.digitalPaymentRatio !== undefined &&
    summary?.digitalPaymentRatio !== null;

  let revenueDeltaClass = "text-zinc-400";
  let revenueDeltaIcon = "lucideMinus";

  if (numDelta > 0) {
    revenueDeltaClass = "text-emerald-400";
    revenueDeltaIcon = "lucideArrowUpRight";
  } else if (numDelta < 0) {
    revenueDeltaClass = "text-rose-400";
    revenueDeltaIcon = "lucideArrowDownRight";
  }

  return {
    currency: summary?.currency ?? "COP",
    digitalPaymentRatioText: `${Math.round(summary?.digitalPaymentRatio ?? 0)}%`,
    hasDigitalRatio,
    hasRevenueDelta,
    revenueDeltaClass,
    revenueDeltaIcon,
    revenueDeltaText:
      numDelta > 0 ? `+${numDelta.toFixed(1)}%` : `${numDelta.toFixed(1)}%`,
    todayRevenue: summary?.todayRevenue ?? 0,
  };
};

const buildTicketsMetrics = (
  summary: DashboardSummaryModel | null
): TicketsKpiMetrics => {
  const activeTickets = summary?.activeTickets ?? 0;
  const totalOrCompletedTickets =
    summary?.completedTickets ?? summary?.totalTickets ?? 0;
  const netFlow = Math.round(activeTickets * 0.05);

  return {
    activeTickets,
    netFlowRateText: netFlow > 0 ? `+${netFlow} veh/h` : "0 veh/h",
    totalOrCompletedTickets,
  };
};

const formatStayHours = (minutes: number): string => {
  if (minutes === 0) {
    return "~0m";
  }
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return hours > 0 ? `~${hours}h ${remMins}m` : `~${remMins}m`;
};

const buildStayMetrics = (
  summary: DashboardSummaryModel | null
): StayKpiMetrics => {
  const avgStay = summary?.avgStayMinutes ?? 0;
  const formattedAvgStayMinutes = Math.round(avgStay);
  const delta = summary?.avgStayDeltaMinutes;
  const hasStayDelta = delta !== undefined && delta !== null;
  const numDelta = delta ?? 0;

  let stayDeltaClass = "text-zinc-400";
  let stayDeltaIcon = "lucideMinus";

  if (numDelta < 0) {
    stayDeltaClass = "text-emerald-400";
    stayDeltaIcon = "lucideArrowDownRight";
  } else if (numDelta > 0) {
    stayDeltaClass = "text-rose-400";
    stayDeltaIcon = "lucideArrowUpRight";
  }

  return {
    completedTickets: summary?.completedTickets ?? 0,
    formattedAvgStayHours: formatStayHours(formattedAvgStayMinutes),
    formattedAvgStayMinutes,
    gracePeriodMinutes: summary?.gracePeriodMinutes,
    hasGracePeriod: (summary?.gracePeriodMinutes ?? 0) > 0,
    hasStayDelta,
    stayDeltaClass,
    stayDeltaIcon,
    stayDeltaText:
      numDelta > 0
        ? `+${numDelta.toFixed(1)} min`
        : `${numDelta.toFixed(1)} min`,
  };
};

export const buildDashboardKpiMetrics = (
  summary: DashboardSummaryModel | null,
  occupancyPercentage = 0
): DashboardKpiMetrics => ({
  occupancy: buildOccupancyMetrics(summary, occupancyPercentage),
  revenue: buildRevenueMetrics(summary),
  stay: buildStayMetrics(summary),
  tickets: buildTicketsMetrics(summary),
});
