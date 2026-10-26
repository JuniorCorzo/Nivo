import type {
  CreateTicket,
  EmailCheckOutCommand,
  NoSendCheckOutCommand,
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
  PriceLine,
  PublicTicketDto,
  RatesInfo,
} from "@core/api/generated/models";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import type {
  CheckOutPayload,
  CreateTicketPayload,
  PaymentRecord,
  PlateCountry,
  PriceDetailedModel,
  PriceLineModel,
  TicketSummary,
} from "@core/models/ticket.model";

export const mapToTicketSummary = (dto: ParkingTicketsDto): TicketSummary => ({
  barcode: dto.id ?? "",
  createdAt: dto.createdAt,
  entryTime: dto.entryTime ?? dto.createdAt ?? "",
  exitTime: dto.exitTime,
  id: dto.id ?? "",
  licensePlate: dto.licensePlate ?? "",
  paymentMethod: dto.paymentMethod,
  phoneNumber: dto.phoneNumber,
  photoUrl: dto.photoUrl,
  plateCountry: dto.plateCountry,
  rateId: dto.rate?.id,
  rateName: dto.rate?.name,
  slotId: dto.slot?.id,
  slotNumber: dto.slot?.slotNumber,
  slotType: dto.slot?.type,
  status: dto.status ?? "OPEN",
  totalToCharge: dto.totalToCharge,
  transactionReference: dto.transactionReference,
  updatedAt: dto.updatedAt,
});

export const mapToCreateTicketDto = (
  payload: CreateTicketPayload
): CreateTicket & {
  plateCountry?: PlateCountry;
  photoUrl?: string;
  phoneNumber?: string;
} => ({
  email: payload.email?.trim() || undefined,
  phoneNumber: payload.phoneNumber?.trim() || undefined,
  photoUrl: payload.photoUrl || undefined,
  plate: payload.plate.trim().toUpperCase(),
  plateCountry: payload.plateCountry,
  rateId: payload.rateId,
  slotId: payload.slotId,
});

export const mapToCheckOutCommand = (
  payload: CheckOutPayload
): NoSendCheckOutCommand | EmailCheckOutCommand => {
  const paymentMethod = payload.paymentMethod ?? "EFFECTIVE";
  if (payload.sendVia === "EMAIL" && payload.email) {
    return {
      email: payload.email.trim(),
      paymentMethod,
      sendVia: "EMAIL",
      ticketId: payload.ticketId,
    };
  }

  return {
    paymentMethod,
    sendVia: "URL",
    ticketId: payload.ticketId,
  };
};

export const mapPriceLine = (dto: PriceLine): PriceLineModel => ({
  amount: dto.amount ?? 0,
  concept: dto.concept ?? "",
});

export const mapToPriceDetailedModel = (
  dto: PriceDetailed
): PriceDetailedModel => ({
  breakdown: (dto.breakpoint ?? []).map((line) => mapPriceLine(line)),
  ivaAmount: dto.ivaAmount ?? 0,
  ivaRate: dto.ivaRate ?? 0,
  name: dto.name ?? "",
  subtotal: dto.subtotal ?? 0,
  total: dto.total ?? 0,
});

export const mapToPaymentRecord = (dto: PaymentsDto): PaymentRecord => ({
  amount: dto.amount ?? 0,
  createdAt: dto.createdAt,
  id: dto.id ?? "",
  paymentMethod: dto.paymentMethod ?? "EFFECTIVE",
  paymentUrl: dto.checkoutUrl,
  status: dto.status ?? "PAID",
});

export const mapToPublicTicketModel = (
  dto: PublicTicketDto
): PublicTicketModel => {
  // SAFETY: Backend RatesInfo OpenAPI schema specifies pricePerUnit, but legacy or alternative payloads may provide price.
  const rate = dto.rate as (RatesInfo & { price?: number }) | undefined;

  return {
    entryTime: dto.entryTime,
    exitTime: dto.exitTime,
    id: dto.id,
    phoneNumber: dto.phoneNumber,
    photoUrl: dto.photoUrl,
    plate: dto.licensePlate,
    plateCountry: dto.plateCountry,
    rateName: dto.rate?.name,
    ratePricePerUnit: rate?.price ?? rate?.pricePerUnit,
    rateTimeUnit: dto.rate?.timeUnit,
    slotNumber: dto.slotSnapshot?.slotNumber,
    status: dto.status,
    totalToCharge: dto.totalToCharge,
  };
};
