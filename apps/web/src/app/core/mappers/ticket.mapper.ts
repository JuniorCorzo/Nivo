import {
  CreateTicket,
  EmailCheckOutCommand,
  NoSendCheckOutCommand,
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
  PriceLine,
} from '@core/api/generated/models';
import {
  CheckOutPayload,
  CreateTicketPayload,
  PaymentRecord,
  PriceDetailedModel,
  PriceLineModel,
  TicketSummary,
} from '@core/models/ticket.model';

export function mapToTicketSummary(dto: ParkingTicketsDto): TicketSummary {
  return {
    id: dto.id ?? '',
    licensePlate: dto.licensePlate ?? '',
    slotId: dto.slot?.id,
    slotNumber: dto.slot?.slotNumber,
    slotType: dto.slot?.type,
    rateId: dto.rate?.id,
    rateName: dto.rate?.name,
    entryTime: dto.entryTime ?? dto.createdAt ?? '',
    exitTime: dto.exitTime,
    totalToCharge: dto.totalToCharge,
    status: dto.status ?? 'OPEN',
    barcode: dto.id ?? '',
    paymentMethod: dto.paymentMethod,
    transactionReference: dto.transactionReference,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapToCreateTicketDto(payload: CreateTicketPayload): CreateTicket {
  return {
    slotId: payload.slotId,
    rateId: payload.rateId,
    plate: payload.plate.trim().toUpperCase(),
    email: payload.email?.trim() || undefined,
  };
}

export function mapToCheckOutCommand(
  payload: CheckOutPayload,
): NoSendCheckOutCommand | EmailCheckOutCommand {
  const paymentMethod = payload.paymentMethod ?? 'EFFECTIVE';
  if (payload.sendVia === 'EMAIL' && payload.email) {
    return {
      sendVia: 'EMAIL',
      ticketId: payload.ticketId,
      paymentMethod,
      email: payload.email.trim(),
    };
  }

  return {
    sendVia: 'URL',
    ticketId: payload.ticketId,
    paymentMethod,
  };
}

export function mapPriceLine(dto: PriceLine): PriceLineModel {
  return {
    concept: dto.concept ?? '',
    amount: dto.amount ?? 0,
  };
}

export function mapToPriceDetailedModel(dto: PriceDetailed): PriceDetailedModel {
  return {
    name: dto.name ?? '',
    subtotal: dto.subtotal ?? 0,
    ivaRate: dto.ivaRate ?? 0,
    ivaAmount: dto.ivaAmount ?? 0,
    total: dto.total ?? 0,
    breakdown: (dto.breakpoint ?? []).map((line) => mapPriceLine(line)),
  };
}

export function mapToPaymentRecord(dto: PaymentsDto): PaymentRecord {
  return {
    id: dto.id ?? '',
    amount: dto.amount ?? 0,
    paymentMethod: dto.paymentMethod ?? 'EFFECTIVE',
    paymentUrl: dto.checkoutUrl,
    status: dto.status ?? 'PAID',
    createdAt: dto.createdAt,
  };
}
