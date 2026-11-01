import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import type {
  ParkingLotListItemResponse,
  ResponseListParkingLotListItemResponse,
  ResponseParkingLotsResponse,
} from "@core/api/generated/models";
import { ParkingLotsService } from "@core/api/generated/services/parking-lots.service";
import type { ParkingTelemetryModel } from "@core/models/parking-telemetry.model";
import type { UpsertParkingLotsModel } from "@core/models/parking.model";
import { firstValueFrom, of, throwError } from "rxjs";
import { vi } from "vitest";

import { ParkingService } from "./parking-service";

const mockParkingLotItem: ParkingLotListItemResponse = {
  address: {
    city: "Bogotá",
    country: "Colombia",
    state: "Cundinamarca",
    street: "Calle 100 # 19-45",
    zipCode: "110111",
  },
  coordinates: { latitude: 4.6855, longitude: -74.0558 },
  createdAt: "2026-01-01T00:00:00Z",
  currency: "COP",
  gracePeriodMinutes: 15,
  gracePeriodPrice: 0,
  id: "lot-1",
  ivaRate: 19,
  name: "Sede Centro",
  occuppationRate: 0,
  operatingHours: {
    closeTime: "22:00",
    openTime: "06:00",
  },
  ownerName: "Admin",
  slotDistribution: [],
  totalCapacity: 100,
  updatedAt: "2026-01-02T00:00:00Z",
};

const mockListResponse: ResponseListParkingLotListItemResponse = {
  data: [mockParkingLotItem],
  message: "Success",
  status: "200",
  timestamp: "2026-01-01T00:00:00Z",
};

interface MockParkingLotsService {
  createParkingLots: ReturnType<typeof vi.fn>;
  deleteParkingLot: ReturnType<typeof vi.fn>;
  deleteSlotGroup: ReturnType<typeof vi.fn>;
  listParkingLots: ReturnType<typeof vi.fn>;
  updateParkingLots: ReturnType<typeof vi.fn>;
}

describe("ParkingService", () => {
  let service: ParkingService;
  let parkingLotsServiceSpy: MockParkingLotsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    parkingLotsServiceSpy = {
      createParkingLots: vi.fn(),
      deleteParkingLot: vi.fn(),
      deleteSlotGroup: vi.fn(),
      listParkingLots: vi.fn().mockReturnValue(of(mockListResponse)),
      updateParkingLots: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ParkingService,
        ApiConfiguration,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ParkingLotsService, useValue: parkingLotsServiceSpy },
      ],
    });

    service = TestBed.inject(ParkingService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("debe invocar getAll() en el constructor y actualizar la señal parkingLots", () => {
    expect(parkingLotsServiceSpy.listParkingLots).toHaveBeenCalledTimes(1);
    expect(service.parkingLots()).toHaveLength(1);
    expect(service.parkingLots()[0]?.id).toBe("lot-1");
    expect(service.parkingLots()[0]?.name).toBe("Sede Centro");
  });

  it("debe re-invocar getAll() y actualizar la señal parkingLots al llamar a refresh()", () => {
    expect(parkingLotsServiceSpy.listParkingLots).toHaveBeenCalledTimes(1);

    const secondLot: ParkingLotListItemResponse = {
      ...mockParkingLotItem,
      id: "lot-2",
      name: "Sede Norte",
    };
    parkingLotsServiceSpy.listParkingLots.mockReturnValue(
      of({
        data: [mockParkingLotItem, secondLot],
        message: "Success",
        status: "200",
        timestamp: "2026-01-01T00:00:00Z",
      })
    );

    service.refresh();

    expect(parkingLotsServiceSpy.listParkingLots).toHaveBeenCalledTimes(2);
    expect(service.parkingLots()).toHaveLength(2);
    expect(service.parkingLots()[1]?.id).toBe("lot-2");
    expect(service.parkingLots()[1]?.name).toBe("Sede Norte");
  });

  it("debe manejar errores HTTP/401 sin lanzar excepciones no controladas ni colapsar el servicio", () => {
    parkingLotsServiceSpy.listParkingLots.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            statusText: "Unauthorized",
          })
      )
    );

    expect(() => service.refresh()).not.toThrow();
    // The previous state is preserved gracefully
    expect(service.parkingLots()).toHaveLength(1);
  });

  it("debe inicializarse con array vacío sin lanzar excepción si el llamado inicial falla con 401", () => {
    TestBed.resetTestingModule();
    const failingSpy: MockParkingLotsService = {
      createParkingLots: vi.fn(),
      deleteParkingLot: vi.fn(),
      deleteSlotGroup: vi.fn(),
      listParkingLots: vi.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              statusText: "Unauthorized",
            })
        )
      ),
      updateParkingLots: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ParkingService,
        ApiConfiguration,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ParkingLotsService, useValue: failingSpy },
      ],
    });

    let failingService!: ParkingService;
    expect(() => {
      failingService = TestBed.inject(ParkingService);
    }).not.toThrow();
    expect(failingService.parkingLots()).toEqual([]);
  });

  it("getAll() debe retornar lista mapeada a ParkingLotListItemModel", async () => {
    const result = await firstValueFrom(service.getAll());
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("lot-1");
    expect(result[0]?.name).toBe("Sede Centro");
  });

  it("getById() debe retornar el parqueadero si existe", async () => {
    const result = await firstValueFrom(service.getById("lot-1"));
    expect(result.id).toBe("lot-1");
    expect(result.name).toBe("Sede Centro");
  });

  it("getById() debe lanzar error si el ID no existe", async () => {
    await expect(
      firstValueFrom(service.getById("lot-unknown"))
    ).rejects.toThrow("Parking lot with ID lot-unknown not found");
  });

  it("create() debe llamar a createParkingLots y refrescar el estado", async () => {
    const mockModel: UpsertParkingLotsModel = {
      address: {
        city: "Bogotá",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 100",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.68, longitude: -74.05 },
      currency: "COP",
      gracePeriodMinutes: 15,
      gracePeriodPrice: 0,
      ivaRate: 19,
      name: "Nueva Sede",
      operatingHours: {
        closeTime: "22:00",
        openTime: "06:00",
      },
      slots: [],
      timezone: "America/Bogota",
    };

    const mockCreateResponse: ResponseParkingLotsResponse = {
      data: {
        ...mockModel,
        createdAt: "2026-01-01T00:00:00Z",
        id: "lot-new",
        owner: {
          contactInfo: "3001234567",
          email: "admin@nivo.com",
          fullName: "Admin",
          id: "u-1",
          role: "OWNER",
        },
        tenant: { companyName: "Nivo", id: "t-1" },
        updatedAt: "2026-01-01T00:00:00Z",
      },
      message: "Created",
      status: "201",
      timestamp: "2026-01-01T00:00:00Z",
    };

    parkingLotsServiceSpy.createParkingLots.mockReturnValue(
      of(mockCreateResponse)
    );

    const result = await firstValueFrom(service.create(mockModel));
    expect(parkingLotsServiceSpy.createParkingLots).toHaveBeenCalled();
    expect(result.id).toBe("lot-new");
    // Verifies updateState was called via tap
    expect(parkingLotsServiceSpy.listParkingLots).toHaveBeenCalledTimes(2);
  });

  it("getTelemetry() debe realizar GET a /parking-lots/{id}/telemetry y retornar res.data", async () => {
    const mockTelemetry: ParkingTelemetryModel = {
      activeTickets: 20,
      averageTicketRevenue: 7500,
      avgStayMinutes: 42.5,
      carOccupied: 12,
      carRate: 40,
      carTotal: 30,
      completedTicketsToday: 25,
      moraCount: 1,
      motoOccupied: 8,
      motoRate: 40,
      motoTotal: 20,
      occupancyRate: 40,
      occupiedSlots: 20,
      availableSlots: 30,
      occupiedSlotsDetail: [
        {
          licensePlate: "ABC123",
          prefix: "A",
          slotNumber: "01",
          type: "CAR",
          zone: "Norte",
        },
      ],
      parkingId: "lot-1",
      rotationIndex: 0.9,
      shiftRevenue: 150000,
      shiftTargetPercentage: 75.5,
      totalCapacity: 50,
      totalTicketsToday: 45,
    };

    const telemetryPromise = firstValueFrom(service.getTelemetry("lot-1"));

    const req = httpTesting.expectOne((r) =>
      r.url.endsWith("/parking-lots/lot-1/telemetry")
    );
    expect(req.request.method).toBe("GET");
    req.flush({ data: mockTelemetry });

    const result = await telemetryPromise;
    expect(result).toEqual(mockTelemetry);
  });

  it("getTelemetry() debe propagar errores HTTP", async () => {
    const telemetryPromise = firstValueFrom(service.getTelemetry("lot-err"));

    const req = httpTesting.expectOne((r) =>
      r.url.endsWith("/parking-lots/lot-err/telemetry")
    );
    expect(req.request.method).toBe("GET");
    req.flush(
      { message: "Not found" },
      { status: 404, statusText: "Not Found" }
    );

    await expect(telemetryPromise).rejects.toThrow();
  });
});
