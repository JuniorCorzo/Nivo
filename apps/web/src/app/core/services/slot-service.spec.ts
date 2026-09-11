import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import type {
  ResponseListSlotResponse,
  SlotSummaryResponse,
} from "@core/api/generated/models";
import { SlotsService } from "@core/api/generated/services";
import type { Slot } from "@core/models/slot.model";
import { of } from "rxjs";

import { mapToSlotSummary, SlotService } from "./slot-service";

describe("mapToSlotSummary", () => {
  it("should map hasTicket, hasHistory, and metadata flags when provided", () => {
    const api: SlotSummaryResponse = {
      hasCharger: true,
      hasHistory: true,
      hasTicket: true,
      id: "abc",
      isAccessible: true,
      isActive: true,
      numberSlot: "001",
      parkingName: "Test",
      prefix: "P",
      status: "OCCUPIED",
      type: "CAR",
      zone: "A",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(true);
    expect(result.hasHistory).toBe(true);
    expect(result.status).toBe("OCCUPIED");
    expect(result.hasCharger).toBe(true);
    expect(result.isAccessible).toBe(true);
    expect(result.isActive).toBe(true);
  });

  it("should map hasTicket, hasHistory, and metadata flags when false", () => {
    const api: SlotSummaryResponse = {
      hasCharger: false,
      hasHistory: false,
      hasTicket: false,
      id: "abc",
      isAccessible: false,
      isActive: false,
      numberSlot: "002",
      parkingName: "Test",
      prefix: "Q",
      status: "AVAILABLE",
      type: "MOTORCYCLE",
      zone: "B",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe("AVAILABLE");
    expect(result.hasCharger).toBe(false);
    expect(result.isAccessible).toBe(false);
    expect(result.isActive).toBe(false);
  });

  it("should default flags to false/true when undefined", () => {
    const api: SlotSummaryResponse = {
      id: "abc",
      numberSlot: "003",
      parkingName: "Test",
      prefix: "R",
      status: "MAINTENANCE",
      type: "BIKE",
      zone: "C",
    };

    const result = mapToSlotSummary(api);

    expect(result.hasTicket).toBe(false);
    expect(result.hasHistory).toBe(false);
    expect(result.status).toBe("MAINTENANCE");
    expect(result.hasCharger).toBe(false);
    expect(result.isAccessible).toBe(false);
    expect(result.isActive).toBe(true);
  });
});

describe("SlotService metadata and group operations", () => {
  let service: SlotService;
  let httpTesting: HttpTestingController;

  const mockParkingInfo = {
    address: { city: "", country: "", state: "", street: "", zipCode: "" },
    coordinates: { latitude: 0, longitude: 0 },
    currency: "COP",
    id: "p-1",
    name: "Lot 1",
    operatingHours: { closeTime: "22:00", daysOfWeek: [], openTime: "06:00" },
    timezone: "America/Bogota",
  };

  const mockTenantInfo = {
    companyName: "Tenant",
    id: "t-1",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SlotService,
        ApiConfiguration,
        {
          provide: SlotsService,
          useValue: {
            batchDelete: vi.fn(),
            createSlots: vi.fn(),
            deleteSlot: vi.fn(),
            listSlotSummaries: vi.fn().mockReturnValue(of({ data: [] })),
            updateSlot: vi.fn(),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SlotService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should update slot metadata via PATCH /slots/metadata", () => {
    const mockPayload = {
      hasCharger: true,
      isAccessible: true,
      isActive: true,
      slotIds: ["slot-1", "slot-2"],
    };

    const mockApiResponse: ResponseListSlotResponse = {
      data: [
        {
          createdAt: "2026-01-01T00:00:00Z",
          hasCharger: true,
          id: "slot-1",
          isAccessible: true,
          isActive: true,
          parking: mockParkingInfo,
          slotNumber: "A-001",
          status: "AVAILABLE",
          tenant: mockTenantInfo,
          type: "CAR",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
      message: "Slot metadata updated successfully",
      status: "200",
      timestamp: "2026-01-01T00:00:00Z",
    };

    let resultSlots: Slot[] | undefined;
    service.updateSlotMetadata(mockPayload).subscribe((slots) => {
      resultSlots = slots;
    });

    const req = httpTesting.expectOne(
      (request) =>
        request.url.endsWith("/slots/metadata") && request.method === "PATCH"
    );

    expect(req.request.body).toEqual(mockPayload);
    req.flush(mockApiResponse);

    expect(resultSlots).toBeDefined();
    expect(resultSlots?.length).toBe(1);
    expect(resultSlots?.[0].hasCharger).toBe(true);
    expect(resultSlots?.[0].isAccessible).toBe(true);
    expect(resultSlots?.[0].isActive).toBe(true);
  });

  it("should update slot group via PATCH /slots/groups", () => {
    const mockPayload = {
      currentPrefix: "A",
      currentZone: "NORTE",
      newPrefix: "B",
      newZone: "SUR",
      parkingId: "parking-1",
    };

    const mockApiResponse: ResponseListSlotResponse = {
      data: [
        {
          createdAt: "2026-01-01T00:00:00Z",
          hasCharger: false,
          id: "slot-1",
          isAccessible: false,
          isActive: true,
          parking: { ...mockParkingInfo, id: "parking-1" },
          slotNumber: "B-001",
          status: "AVAILABLE",
          tenant: mockTenantInfo,
          type: "CAR",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
      message: "Slot group updated successfully",
      status: "200",
      timestamp: "2026-01-01T00:00:00Z",
    };

    let resultSlots: Slot[] | undefined;
    service.updateSlotGroup(mockPayload).subscribe((slots) => {
      resultSlots = slots;
    });

    const req = httpTesting.expectOne(
      (request) =>
        request.url.endsWith("/slots/groups") && request.method === "PATCH"
    );

    expect(req.request.body).toEqual(mockPayload);
    req.flush(mockApiResponse);

    expect(resultSlots).toBeDefined();
    expect(resultSlots?.length).toBe(1);
    expect(resultSlots?.[0].slotNumber).toBe("B-001");
  });
});
