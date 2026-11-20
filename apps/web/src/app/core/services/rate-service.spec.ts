import { TestBed } from "@angular/core/testing";
import type {
  ResponseIterableRatesDto,
  SimulateRateResponse,
} from "@core/api/generated/models";
import {
  ParkingLotsService,
  PublicSimulatorService,
  RatesService,
  TenantsService,
} from "@core/api/generated/services";
import { firstValueFrom, of } from "rxjs";

import { RateService } from "./rate-service";

interface MockParkingLotsService {
  showRatesByParkingId: ReturnType<typeof vi.fn>;
  createRateForParking: ReturnType<typeof vi.fn>;
}

interface MockRatesService {
  updateRate: ReturnType<typeof vi.fn>;
  deleteRate: ReturnType<typeof vi.fn>;
  calculatePrice: ReturnType<typeof vi.fn>;
}

interface MockTenantsService {
  showSpecialPoliciesByTenant: ReturnType<typeof vi.fn>;
}

interface MockPublicSimulatorService {
  calculate: ReturnType<typeof vi.fn>;
}

describe("RateService", () => {
  let service: RateService;
  let parkingLotsServiceSpy: MockParkingLotsService;
  let publicSimulatorServiceSpy: MockPublicSimulatorService;
  let ratesServiceSpy: MockRatesService;
  let tenantsServiceSpy: MockTenantsService;

  beforeEach(() => {
    parkingLotsServiceSpy = {
      createRateForParking: vi.fn(),
      showRatesByParkingId: vi.fn(),
    };
    publicSimulatorServiceSpy = {
      calculate: vi.fn(),
    };
    ratesServiceSpy = {
      calculatePrice: vi.fn(),
      deleteRate: vi.fn(),
      updateRate: vi.fn(),
    };
    tenantsServiceSpy = {
      showSpecialPoliciesByTenant: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        RateService,
        { provide: ParkingLotsService, useValue: parkingLotsServiceSpy },
        {
          provide: PublicSimulatorService,
          useValue: publicSimulatorServiceSpy,
        },
        { provide: RatesService, useValue: ratesServiceSpy },
        { provide: TenantsService, useValue: tenantsServiceSpy },
      ],
    });

    service = TestBed.inject(RateService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("CRUD Operations", () => {
    it("should fetch rates by parking ID", async () => {
      const mockResponse: ResponseIterableRatesDto = {
        data: [
          {
            createdAt: "2024-01-01T00:00:00Z",
            description: "Car standard rate",
            id: "rate-1",
            minChargeTimeMinutes: "15",
            name: "Standard Car",
            pricePerUnit: 4000,
            timeUnit: "HOURS",
            vehicleType: "CAR",
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };

      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValue(
        of(mockResponse)
      );

      const rates = await firstValueFrom(
        service.getRatesByParkingId("parking-123")
      );
      expect(rates.length).toBe(1);
      expect(rates[0].name).toBe("Standard Car");
      expect(rates[0].pricePerUnit).toBe(4000);
      expect(rates[0].minChargeTimeMinutes).toBe(15);
    });
  });

  describe("Public Rate Simulation", () => {
    it("should delegate rate calculation to PublicSimulatorService and map response", async () => {
      const mockResponse: SimulateRateResponse = {
        breakpoints: [
          {
            amount: 8000,
            concept: "Tarifa CAR (2 Horas * 4000 COP/Horas)",
          },
        ],
        ivaAmount: 1520,
        ivaRate: 0.19,
        name: "Simulador Nivo",
        subtotal: 8000,
        total: 9520,
      };

      publicSimulatorServiceSpy.calculate.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(
        service.simulateRate({
          gracePeriodMinutes: 15,
          minutesStayed: 90,
          pricePerUnit: 4000,
          timeUnit: "HOURS",
          vehicleType: "CAR",
        })
      );

      expect(publicSimulatorServiceSpy.calculate).toHaveBeenCalledWith({
        body: {
          gracePeriodMinutes: 15,
          ivaRate: undefined,
          minutesStayed: 90,
          pricePerUnit: 4000,
          timeUnit: "HOURS",
          vehicleType: "CAR",
        },
      });
      expect(result).toEqual({
        breakpoints: [
          {
            amount: 8000,
            concept: "Tarifa CAR (2 Horas * 4000 COP/Horas)",
          },
        ],
        ivaAmount: 1520,
        ivaRate: 0.19,
        name: "Simulador Nivo",
        subtotal: 8000,
        total: 9520,
      });
    });
  });
});
