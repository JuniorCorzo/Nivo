export type TicketStatus = "OPEN" | "CLOSED" | "LOST" | "ANNULLED";
export type TicketPaymentMethod = "EFFECTIVE" | "PAY_LINK";
export type TicketSendVia = "URL" | "EMAIL" | "SMS";

export interface PriceLineModel {
  concept: string;
  amount: number;
}

export interface PriceDetailedModel {
  name: string;
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
  breakdown: PriceLineModel[];
}

export interface CreateTicketPayload {
  slotId: string;
  rateId: string;
  plate: string;
  email?: string;
}

export interface CheckOutPayload {
  ticketId: string;
  sendVia?: TicketSendVia;
  paymentMethod?: TicketPaymentMethod;
  email?: string;
}

export interface TicketSummary {
  id: string;
  licensePlate: string;
  slotId?: string;
  slotNumber?: string;
  slotType?: string;
  rateId?: string;
  rateName?: string;
  entryTime: string;
  exitTime?: string;
  totalToCharge?: number;
  status: TicketStatus;
  barcode?: string;
  paymentMethod?: string;
  transactionReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentUrl?: string;
  status: string;
  ticket?: TicketSummary;
  createdAt?: string;
}
