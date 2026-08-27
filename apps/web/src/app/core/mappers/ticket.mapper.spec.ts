import {
  mapToCheckOutCommand,
  mapToCreateTicketDto,
  mapToPaymentRecord,
  mapToPriceDetailedModel,
  mapToTicketSummary,
} from './ticket.mapper';
import {
  CheckOutPayload,
  CreateTicketPayload,
} from '@core/models/ticket.model';
import {
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
} from '@core/api/generated/models';

describe('TicketMapper', () => {
  it('should map CreateTicketPayload to CreateTicket DTO with uppercase plate', () => {
    const payload: CreateTicketPayload = {
      slotId: 'slot-123',
      rateId: 'rate-456',
      plate: '  abc-123  ',
      email: '  test@example.com ',
    };

    const dto = mapToCreateTicketDto(payload);

    expect(dto.slotId).toBe('slot-123');
    expect(dto.rateId).toBe('rate-456');
    expect(dto.plate).toBe('ABC-123');
    expect(dto.email).toBe('test@example.com');
  });

  it('should map CheckOutPayload to NoSendCheckOutCommand for URL dispatch', () => {
    const payload: CheckOutPayload = {
      ticketId: 'tck-1',
      sendVia: 'URL',
      paymentMethod: 'EFFECTIVE',
    };

    const cmd = mapToCheckOutCommand(payload);

    expect(cmd.sendVia).toBe('URL');
    expect(cmd.ticketId).toBe('tck-1');
    expect(cmd.paymentMethod).toBe('EFFECTIVE');
  });

  it('should map CheckOutPayload to EmailCheckOutCommand for EMAIL dispatch', () => {
    const payload: CheckOutPayload = {
      ticketId: 'tck-2',
      sendVia: 'EMAIL',
      paymentMethod: 'PAY_LINK',
      email: 'client@domain.com',
    };

    const cmd = mapToCheckOutCommand(payload) as any;

    expect(cmd.sendVia).toBe('EMAIL');
    expect(cmd.ticketId).toBe('tck-2');
    expect(cmd.paymentMethod).toBe('PAY_LINK');
    expect(cmd.email).toBe('client@domain.com');
  });

  it('should map ParkingTicketsDto to TicketSummary', () => {
    const dto: ParkingTicketsDto = {
      id: 'ticket-99',
      licensePlate: 'XYZ789',
      status: 'OPEN',
      entryTime: '2026-08-27T10:00:00Z',
      slot: {
        id: 's-1',
        slotNumber: '101',
        type: 'CAR',
      },
      rate: {
        id: 'r-1',
        name: 'Tarifa Carros',
      },
      user: {
        id: 'u-1',
        fullName: 'Operator 1',
        email: 'op@test.com',
        contactInfo: '123456',
        role: 'OPERATOR',
      },
    };

    const model = mapToTicketSummary(dto);

    expect(model.id).toBe('ticket-99');
    expect(model.licensePlate).toBe('XYZ789');
    expect(model.status).toBe('OPEN');
    expect(model.slotId).toBe('s-1');
    expect(model.slotNumber).toBe('101');
    expect(model.rateName).toBe('Tarifa Carros');
  });

  it('should map PriceDetailed DTO to PriceDetailedModel with breakdown', () => {
    const dto: PriceDetailed = {
      name: 'Tarifa Estándar',
      subtotal: 10000,
      ivaRate: 19,
      ivaAmount: 1900,
      total: 11900,
      breakpoint: [
        {
          concept: '2 Horas Estándar',
          amount: 10000,
        },
      ],
    };

    const model = mapToPriceDetailedModel(dto);

    expect(model.name).toBe('Tarifa Estándar');
    expect(model.subtotal).toBe(10000);
    expect(model.ivaRate).toBe(19);
    expect(model.ivaAmount).toBe(1900);
    expect(model.total).toBe(11900);
    expect(model.breakdown.length).toBe(1);
    expect(model.breakdown[0].concept).toBe('2 Horas Estándar');
    expect(model.breakdown[0].amount).toBe(10000);
  });

  it('should map PaymentsDto to PaymentRecord', () => {
    const dto: PaymentsDto = {
      id: 'pay-123',
      amount: 11900,
      paymentMethod: 'EFFECTIVE',
      status: 'PAID',
      createdAt: '2026-08-27T12:00:00Z',
    };

    const model = mapToPaymentRecord(dto);

    expect(model.id).toBe('pay-123');
    expect(model.amount).toBe(11900);
    expect(model.paymentMethod).toBe('EFFECTIVE');
    expect(model.status).toBe('PAID');
  });
});
