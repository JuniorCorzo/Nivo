export type SlotType = 'CAR' | 'MOTORCYCLE' | 'BIKE' | 'ELECTRIC_VEHICLE' | 'DISABLED';

export type CreatedSlot = {
  numberSlots?: number;
  prefix?: string;
  slotType: SlotType;
  zone?: string;
};
