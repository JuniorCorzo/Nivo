export type SlotType =
  | "CAR"
  | "MOTORCYCLE"
  | "BIKE"
  | "ELECTRIC_VEHICLE"
  | "DISABLED";

export interface SlotDistribution {
  prefix: string;
  zone: string;
  type: SlotType;
  count: number;
}
