import type { SlotType } from "./slot-distribution.type";

export type ParkingSlotStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "RESERVED";

export interface ParkingSlot {
  id: string;
  parkingId: string;
  number: string;
  prefix: string;
  zone: string;
  type: SlotType;
  status: ParkingSlotStatus;
  hasTicket: boolean;
  hasHistory: boolean;
  plate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSlotBatch {
  prefix: string;
  from: number;
  to: number;
  zone: string;
  type: SlotType;
  status: ParkingSlotStatus;
}
