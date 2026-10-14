import type { PlateCountry, TicketStatus } from "./ticket.model";

export interface PublicTicketModel {
  id: string;
  plate: string;
  plateCountry?: PlateCountry;
  status: TicketStatus;
  entryTime: string;
  exitTime?: string;
  totalToCharge?: number;
  slotNumber?: string;
  rateName?: string;
  ratePricePerUnit?: number;
  rateTimeUnit?: string;
  parkingLotName?: string;
  photoUrl?: string;
  phoneNumber?: string;
}
