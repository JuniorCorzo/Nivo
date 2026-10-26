import { TestBed } from "@angular/core/testing";
import type { ResponsePublicTicketDto } from "@core/api/generated/models";
import { PublicTicketsService } from "@core/api/generated/services";
import { firstValueFrom, of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicTicketService } from "./public-ticket.service";

interface MockPublicTicketsService {
  getPublicTicket: ReturnType<typeof vi.fn>;
}

describe("PublicTicketService", () => {
  let service: PublicTicketService;
  let publicTicketsServiceMock: MockPublicTicketsService;

  const mockPublicTicketDto = {
    entryTime: "2026-10-14T01:00:00Z",
    exitTime: "2026-10-14T03:00:00Z",
    id: "ticket-uuid-1",
    licensePlate: "SP-1001",
    phoneNumber: "+573001234567",
    photoUrl: "data:image/jpeg;base64,mock",
    plateCountry: "UNPLATED" as const,
    rate: {
      description: "Tarifa Motos",
      id: "rate-moto",
      minChargeTimeMinutes: 15,
      name: "Tarifa Moto",
      pricePerUnit: 2000,
      timeUnit: "HOURS" as const,
      vehicleType: "MOTORCYCLE" as const,
    },
    slotSnapshot: {
      slotNumber: "M-01",
    },
    status: "OPEN" as const,
    totalToCharge: 5000,
  };

  const mockEnvelopeResponse: ResponsePublicTicketDto = {
    data: mockPublicTicketDto,
    message: "Public ticket retrieved successfully",
    status: "200 OK",
    timestamp: "2026-10-25T20:00:00Z",
  };

  beforeEach(() => {
    publicTicketsServiceMock = {
      getPublicTicket: vi.fn().mockReturnValue(of(mockEnvelopeResponse)),
    };

    TestBed.configureTestingModule({
      providers: [
        PublicTicketService,
        {
          provide: PublicTicketsService,
          useValue: publicTicketsServiceMock,
        },
      ],
    });

    service = TestBed.inject(PublicTicketService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call PublicTicketsService.getPublicTicket with { id } and return mapped PublicTicketModel", async () => {
    const result = await firstValueFrom(
      service.getPublicTicket("ticket-uuid-1")
    );

    expect(publicTicketsServiceMock.getPublicTicket).toHaveBeenCalledWith({
      id: "ticket-uuid-1",
    });
    expect(result).toEqual({
      entryTime: "2026-10-14T01:00:00Z",
      exitTime: "2026-10-14T03:00:00Z",
      id: "ticket-uuid-1",
      phoneNumber: "+573001234567",
      photoUrl: "data:image/jpeg;base64,mock",
      plate: "SP-1001",
      plateCountry: "UNPLATED",
      rateName: "Tarifa Moto",
      ratePricePerUnit: 2000,
      rateTimeUnit: "HOURS",
      slotNumber: "M-01",
      status: "OPEN",
      totalToCharge: 5000,
    });
  });

  it("should correctly map ticket when optional fields are omitted", async () => {
    const minimalEnvelope: ResponsePublicTicketDto = {
      data: {
        entryTime: "2026-10-14T01:00:00Z",
        id: "ticket-uuid-2",
        licensePlate: "ABC-123",
        plateCountry: "CO",
        rate: {
          description: "Tarifa Carros",
          id: "rate-car",
          minChargeTimeMinutes: 0,
          name: "Standard Car",
          pricePerUnit: 4000,
          timeUnit: "HOURS",
          vehicleType: "CAR",
        },
        status: "OPEN",
      },
      message: "Retrieved",
      status: "200 OK",
      timestamp: "2026-10-25T20:00:00Z",
    };

    publicTicketsServiceMock.getPublicTicket.mockReturnValue(
      of(minimalEnvelope)
    );

    const result = await firstValueFrom(
      service.getPublicTicket("ticket-uuid-2")
    );

    expect(publicTicketsServiceMock.getPublicTicket).toHaveBeenCalledWith({
      id: "ticket-uuid-2",
    });
    expect(result).toEqual({
      entryTime: "2026-10-14T01:00:00Z",
      exitTime: undefined,
      id: "ticket-uuid-2",
      phoneNumber: undefined,
      photoUrl: undefined,
      plate: "ABC-123",
      plateCountry: "CO",
      rateName: "Standard Car",
      ratePricePerUnit: 4000,
      rateTimeUnit: "HOURS",
      slotNumber: undefined,
      status: "OPEN",
      totalToCharge: undefined,
    });
  });
});
