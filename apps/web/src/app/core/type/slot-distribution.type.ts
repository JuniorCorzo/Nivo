export type SlotType = 'CAR' | 'MOTORCYCLE' | 'BIKE' | 'ELECTRIC_VEHICLE' | 'DISABLED';

export type SlotDistribution = {
  prefix: string;
  zone: string;
  type: SlotType;
  count: number;
};
