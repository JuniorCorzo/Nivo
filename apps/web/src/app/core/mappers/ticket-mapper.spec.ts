import type {
  EmailCheckOutCommand,
  ParkingTicketsDto,
  PaymentsDto,
  PriceDetailed,
  PublicTicketDto,
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
  mapToPublicTicketModel,
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
      createdAt: "2026-08-27T10:00:00Z",
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-99",
      licensePlate: "XYZ789",
      plateCountry: "CO",
      rate: {
        description: "Tarifa Carros",
        id: "r-1",
        minChargeTimeMinutes: 0,
        name: "Tarifa Carros",
        pricePerUnit: 2000,
        timeUnit: "HOURS",
        vehicleType: "CAR",
      },
      slot: {
        id: "s-1",
        slotNumber: "101",
        type: "CAR",
      },
      status: "OPEN",
      tenant: { companyName: "Tenant 1", id: "t-1" },
      updatedAt: "2026-08-27T10:00:00Z",
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

  describe("mapToPublicTicketModel", () => {
    it("should map complete PublicTicketDto to PublicTicketModel", () => {
      const dto: PublicTicketDto = {
        entryTime: "2026-10-14T01:00:00Z",
        exitTime: "2026-10-14T03:00:00Z",
        id: "ticket-101",
        licensePlate: "SP-1042",
        phoneNumber: "+573009876543",
        photoUrl: "https://photos.example.com/ticket-101.jpg",
        plateCountry: "UNPLATED",
        rate: {
          description: "Tarifa estándar motos",
          id: "r-moto",
          minChargeTimeMinutes: 15,
          name: "Tarifa Motos",
          pricePerUnit: 2500,
          timeUnit: "HOURS",
          vehicleType: "MOTORCYCLE",
        },
        slotSnapshot: {
          hasCharger: false,
          id: "slot-m1",
          isAccessible: false,
          prefix: "M",
          slotNumber: "M-02",
          type: "MOTORCYCLE",
          zone: "A",
        },
        status: "OPEN",
        totalToCharge: 5000,
      };

      const model = mapToPublicTicketModel(dto);

      expect(model.id).toBe("ticket-101");
      expect(model.plate).toBe("SP-1042");
      expect(model.plateCountry).toBe("UNPLATED");
      expect(model.status).toBe("OPEN");
      expect(model.entryTime).toBe("2026-10-14T01:00:00Z");
      expect(model.exitTime).toBe("2026-10-14T03:00:00Z");
      expect(model.totalToCharge).toBe(5000);
      expect(model.slotNumber).toBe("M-02");
      expect(model.rateName).toBe("Tarifa Motos");
      expect(model.ratePricePerUnit).toBe(2500);
      expect(model.rateTimeUnit).toBe("HOURS");
      expect(model.photoUrl).toBe("https://photos.example.com/ticket-101.jpg");
      expect(model.phoneNumber).toBe("+573009876543");
    });

    it("should handle omitted optional fields", () => {
      const dto: PublicTicketDto = {
        entryTime: "2026-10-14T01:00:00Z",
        id: "ticket-102",
        licensePlate: "COL-999",
        plateCountry: "CO",
        rate: {
          description: "Desc",
          id: "r-car",
          minChargeTimeMinutes: 0,
          name: "Carros",
          pricePerUnit: 3500,
          timeUnit: "HOURS",
          vehicleType: "CAR",
        },
        status: "CLOSED",
      };

      const model = mapToPublicTicketModel(dto);

      expect(model.id).toBe("ticket-102");
      expect(model.plate).toBe("COL-999");
      expect(model.plateCountry).toBe("CO");
      expect(model.status).toBe("CLOSED");
      expect(model.entryTime).toBe("2026-10-14T01:00:00Z");
      expect(model.exitTime).toBeUndefined();
      expect(model.totalToCharge).toBeUndefined();
      expect(model.slotNumber).toBeUndefined();
      expect(model.rateName).toBe("Carros");
      expect(model.ratePricePerUnit).toBe(3500);
      expect(model.rateTimeUnit).toBe("HOURS");
      expect(model.photoUrl).toBeUndefined();
      expect(model.phoneNumber).toBeUndefined();
    });

    it("should support legacy price property on rate when price is present", () => {
      const dto: PublicTicketDto = {
        entryTime: "2026-10-14T01:00:00Z",
        id: "ticket-103",
        licensePlate: "LEG-001",
        plateCountry: "CO",
        rate: {
          description: "Tarifa",
          id: "r-leg",
          minChargeTimeMinutes: 0,
          name: "Legacy Rate",
          pricePerUnit: 1800,
          timeUnit: "HOURS",
          vehicleType: "MOTORCYCLE",
        },
        status: "OPEN",
      };

      // SAFETY: Testing fallback behavior when legacy price property is attached to rate object.
      Object.assign(dto.rate, { price: 1800 });
      const model = mapToPublicTicketModel(dto);

      expect(model.ratePricePerUnit).toBe(1800);
      expect(model.rateName).toBe("Legacy Rate");
    });
  });
});
