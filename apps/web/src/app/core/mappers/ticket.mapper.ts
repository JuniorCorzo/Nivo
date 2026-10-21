import type {
  CreateTicket,
  EmailCheckOutCommand,
  NoSendCheckOutCommand,
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
  PriceLine,
} from "@core/api/generated/models";
import type {
  CheckOutPayload,
  CreateTicketPayload,
  PaymentRecord,
  PlateCountry,
  PriceDetailedModel,
  PriceLineModel,
  TicketSummary,
} from "@core/models/ticket.model";

export const mapToTicketSummary = (dto: ParkingTicketsDto): TicketSummary => {
  const raw = dto as unknown as Record<string, unknown>;
  return {
    barcode: dto.id ?? "",
    createdAt: dto.createdAt,
    entryTime: dto.entryTime ?? dto.createdAt ?? "",
    exitTime: dto.exitTime,
    id: dto.id ?? "",
    licensePlate: dto.licensePlate ?? "",
    paymentMethod: dto.paymentMethod,
    phoneNumber: raw["phoneNumber"] as string | undefined,
    photoUrl: raw["photoUrl"] as string | undefined,
    plateCountry: raw["plateCountry"] as PlateCountry | undefined,
    rateId: dto.rate?.id,
    rateName: dto.rate?.name,
    slotId: dto.slot?.id,
    slotNumber: dto.slot?.slotNumber,
    slotType: dto.slot?.type,
    status: dto.status ?? "OPEN",
    totalToCharge: dto.totalToCharge,
    transactionReference: dto.transactionReference,
    updatedAt: dto.updatedAt,
  };
};

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
