import type {
  OperationsKpiMetrics,
  OperationsKpiVehicleCard,
} from "@core/models/operations-cockpit.model";
import type { APP_TEXTS } from "@shared/constants/app-texts.constant";

export const calculateOccupiedPercentage = (
  totalSlots: number,
  availableSlots: number
): number => {
  if (totalSlots <= 0) {
    return 0;
  }
  return ((totalSlots - availableSlots) / totalSlots) * 100;
};

export const calculateOccupancyRate = (
  occupiedSlots: number,
  totalSlots: number
): number => {
  if (totalSlots <= 0) {
    return 0;
  }
  return (occupiedSlots / totalSlots) * 100;
};

export const buildOperationsKpiVehicleCards = (
  metrics: OperationsKpiMetrics,
  texts: typeof APP_TEXTS.operations.ribbon
): OperationsKpiVehicleCard[] => {
  const cards: OperationsKpiVehicleCard[] = [];

  if (metrics.totalCarSlotsCount > 0) {
    cards.push({
      available: metrics.availableCarSlotsCount,
      barClass: "bg-success/80",
      icon: "lucideCar",
      iconBoxClass: "bg-success/10 text-success border-success/20",
      id: "CAR",
      label: texts.cars,
      occupiedPct: calculateOccupiedPercentage(
        metrics.totalCarSlotsCount,
        metrics.availableCarSlotsCount
      ),
      total: metrics.totalCarSlotsCount,
    });
  }

  if (metrics.totalMotoSlotsCount > 0) {
    cards.push({
      available: metrics.availableMotoSlotsCount,
      barClass: "bg-primary/80",
      icon: "lucideBike",
      iconBoxClass: "bg-primary/10 text-primary border-primary/20",
      id: "MOTORCYCLE",
      label: texts.motos,
      occupiedPct: calculateOccupiedPercentage(
        metrics.totalMotoSlotsCount,
        metrics.availableMotoSlotsCount
      ),
      total: metrics.totalMotoSlotsCount,
    });
  }

  return cards;
};
