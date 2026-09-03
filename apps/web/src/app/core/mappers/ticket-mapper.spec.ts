import type {
  EmailCheckOutCommand,
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
} from "@core/api/generated/models";
import type {
  CheckOutPayload,
  CreateTicketPayload,
} from "@core/models/ticket.model";

import {
  mapToCheckOutCommand,
  mapToCreateTicketDto,
  mapToPaymentRecord,
  mapToPriceDetailedModel,
  mapToTicketSummary,
} from "./ticket.mapper";

describe("TicketMapper", () => {
  it("should map CreateTicketPayload to CreateTicket DTO with uppercase plate", () => {
    const payload: CreateTicketPayload = {
      email: "  test@example.com ",
      plate: "  abc-123  ",
      rateId: "rate-456",
      slotId: "slot-123",
    };

    const dto = mapToCreateTicketDto(payload);

    expect(dto.slotId).toBe("slot-123");
    expect(dto.rateId).toBe("rate-456");
    expect(dto.plate).toBe("ABC-123");
    expect(dto.email).toBe("test@example.com");
  });

  it("should map CheckOutPayload to NoSendCheckOutCommand for URL dispatch", () => {
    const payload: CheckOutPayload = {
      paymentMethod: "EFFECTIVE",
      sendVia: "URL",
      ticketId: "tck-1",
    };

    const cmd = mapToCheckOutCommand(payload);

    expect(cmd.sendVia).toBe("URL");
    expect(cmd.ticketId).toBe("tck-1");
    expect(cmd.paymentMethod).toBe("EFFECTIVE");
  });

  it("should map CheckOutPayload to EmailCheckOutCommand for EMAIL dispatch", () => {
    const payload: CheckOutPayload = {
      email: "client@domain.com",
      paymentMethod: "PAY_LINK",
      sendVia: "EMAIL",
      ticketId: "tck-2",
    };

    /* SAFETY: When sendVia is EMAIL and email is provided, mapToCheckOutCommand returns EmailCheckOutCommand */
    const cmd = mapToCheckOutCommand(payload) as EmailCheckOutCommand;

    expect(cmd.sendVia).toBe("EMAIL");
    expect(cmd.ticketId).toBe("tck-2");
    expect(cmd.paymentMethod).toBe("PAY_LINK");
    expect(cmd.email).toBe("client@domain.com");
  });

  it("should map ParkingTicketsDto to TicketSummary", () => {
    const dto: ParkingTicketsDto = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-99",
      licensePlate: "XYZ789",
      rate: {
        id: "r-1",
        name: "Tarifa Carros",
      },
      slot: {
        id: "s-1",
        slotNumber: "101",
        type: "CAR",
      },
      status: "OPEN",
      user: {
        contactInfo: "123456",
        email: "op@test.com",
        fullName: "Operator 1",
        id: "u-1",
        role: "OPERATOR",
      },
    };

    const model = mapToTicketSummary(dto);

    expect(model.id).toBe("ticket-99");
    expect(model.licensePlate).toBe("XYZ789");
    expect(model.status).toBe("OPEN");
    expect(model.slotId).toBe("s-1");
    expect(model.slotNumber).toBe("101");
    expect(model.rateName).toBe("Tarifa Carros");
  });

  it("should map PriceDetailed DTO to PriceDetailedModel with breakdown", () => {
    const dto: PriceDetailed = {
      breakpoint: [
        {
          amount: 10_000,
          concept: "2 Horas Estándar",
        },
      ],
      ivaAmount: 1900,
      ivaRate: 19,
      name: "Tarifa Estándar",
      subtotal: 10_000,
      total: 11_900,
    };

    const model = mapToPriceDetailedModel(dto);

    expect(model.name).toBe("Tarifa Estándar");
    expect(model.subtotal).toBe(10_000);
    expect(model.ivaRate).toBe(19);
    expect(model.ivaAmount).toBe(1900);
    expect(model.total).toBe(11_900);
    expect(model.breakdown.length).toBe(1);
    expect(model.breakdown[0].concept).toBe("2 Horas Estándar");
    expect(model.breakdown[0].amount).toBe(10_000);
  });

  it("should map PaymentsDto to PaymentRecord", () => {
    const dto: PaymentsDto = {
      amount: 11_900,
      createdAt: "2026-08-27T12:00:00Z",
      id: "pay-123",
      paymentMethod: "EFFECTIVE",
      status: "PAID",
    };

    const model = mapToPaymentRecord(dto);

    expect(model.id).toBe("pay-123");
    expect(model.amount).toBe(11_900);
    expect(model.paymentMethod).toBe("EFFECTIVE");
    expect(model.status).toBe("PAID");
  });
});
