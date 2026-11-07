import { TestBed } from "@angular/core/testing";
import type { ResponseIterableRatesDto } from "@core/api/generated/models";
import {
  ParkingLotsService,
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
  createAtSpecialPolicies: ReturnType<typeof vi.fn>;
  showSpecialPoliciesByTenant: ReturnType<typeof vi.fn>;
}

describe("RateService", () => {
  let service: RateService;
  let parkingLotsServiceSpy: MockParkingLotsService;
  let ratesServiceSpy: MockRatesService;
  let tenantsServiceSpy: MockTenantsService;

  beforeEach(() => {
    parkingLotsServiceSpy = {
      createRateForParking: vi.fn(),
      showRatesByParkingId: vi.fn(),
    };
    ratesServiceSpy = {
      calculatePrice: vi.fn(),
      deleteRate: vi.fn(),
      updateRate: vi.fn(),
    };
    tenantsServiceSpy = {
      createAtSpecialPolicies: vi.fn(),
      showSpecialPoliciesByTenant: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        RateService,
        { provide: ParkingLotsService, useValue: parkingLotsServiceSpy },
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

    it("should load special policies and update signal", async () => {
      const mockResponse = {
        data: [
          {
            active: true,
            id: "sp-1",
            modifies: "SURCHARGE" as const,
            name: "Lavado",
            operation: "SET" as const,
            valueToModify: 18000,
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };

      /* SAFETY: Mock response payload for unit test */
      tenantsServiceSpy.showSpecialPoliciesByTenant.mockReturnValue(
        of(mockResponse as never)
      );

      const policies = await firstValueFrom(service.loadSpecialPolicies());
      expect(policies.length).toBe(1);
      expect(policies[0].name).toBe("Lavado");
      expect(service.specialPolicies().length).toBe(1);
    });

    it("should create special policy and append to reactive signal", async () => {
      const mockResponse = {
        data: {
          active: true,
          id: "sp-2",
          modifies: "SURCHARGE" as const,
          name: "Tarifa de Lavado",
          operation: "SET" as const,
          valueToModify: 18_000,
        },
        message: "Created",
        status: "CREATED",
        timestamp: "2024-01-01T00:00:00Z",
      };

      /* SAFETY: Mock response payload for unit test */
      tenantsServiceSpy.createAtSpecialPolicies.mockReturnValue(
        of(mockResponse as never)
      );

      const created = await firstValueFrom(
        service.createSpecialPolicy({
          modifies: "SURCHARGE",
          name: "Tarifa de Lavado",
          operation: "SET",
          valueToModify: 18_000,
        })
      );

      expect(created.id).toBe("sp-2");
      expect(created.name).toBe("Tarifa de Lavado");
      expect(service.specialPolicies().some((p) => p.id === "sp-2")).toBe(true);
    });
  });
});
