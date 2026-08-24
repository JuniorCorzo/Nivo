export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type SlotType = 'CAR' | 'MOTORCYCLE' | 'BIKE' | 'ELECTRIC_VEHICLE' | 'DISABLED';

export type SlotModel = {
  id: string;
  slotNumber: string;
  status: SlotStatus;
  type: SlotType;
  parkingId: string;
  createdAt: string;
  updatedAt: string;
};

export type SlotSummary = {
  id: string;
  parkingName: string;
  slotNumber: string;
  prefix: string;
  zone: string;
  type: SlotType;
  status: SlotStatus;
  hasHistory?: boolean;
  hasTicket?: boolean;
};

export type UpsertSlotModel = {
  id?: string;
  parkingLotId: string;
  slotNumber: string;
  status: SlotStatus;
  type: SlotType;
};

export type CreatedSlotGroup = {
  prefix: string;
  zone: string;
  slotType: SlotType;
  numberSlots: number;
};

export type BatchCreateSlotModel = {
  parkingLotId: string;
  slots: CreatedSlotGroup[];
};

export type BatchSlotModel = {
  prefix: string;
  from: number;
  to: number;
  zone: string;
  type: SlotType;
  status: SlotStatus;
};

