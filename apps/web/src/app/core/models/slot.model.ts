export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
export type SlotType =
  | "CAR"
  | "MOTORCYCLE"
  | "BIKE"
  | "ELECTRIC_VEHICLE"
  | "DISABLED";

export interface SlotModel {
  id: string;
  slotNumber: string;
  status: SlotStatus;
  type: SlotType;
  parkingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotSummary {
  id: string;
  parkingName: string;
  slotNumber: string;
  prefix: string;
  zone: string;
  type: SlotType;
  status: SlotStatus;
  hasHistory?: boolean;
  hasTicket?: boolean;
}

export interface UpsertSlotModel {
  id?: string;
  parkingLotId: string;
  slotNumber: string;
  status: SlotStatus;
  type: SlotType;
}

export interface CreatedSlotGroup {
  prefix: string;
  zone: string;
  slotType: SlotType;
  numberSlots: number;
}

export interface BatchCreateSlotModel {
  parkingLotId: string;
  slots: CreatedSlotGroup[];
}

export interface BatchSlotModel {
  prefix: string;
  from: number;
  to: number;
  zone: string;
  type: SlotType;
  status: SlotStatus;
}
