import { TestBed } from "@angular/core/testing";
import type { ResponseIterableRatesDto } from "@core/api/generated/models";
import {
  ParkingLotsService,
  RatesService,
  TenantsService,
} from "@core/api/generated/services";
import type { SpecialPolicyModel } from "@core/models/rate.model";
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

  describe("simulateCalculation", () => {
    it("should compute hourly rate calculation accurately", () => {
      // 3 hours (ceil)
      const res = RateService.simulateCalculation({
        basePrice: 5000,
        durationInMinutes: 125,
        timeUnit: "HOURS",
      });

      expect(res.unitsCalculated).toBe(3);
      expect(res.subtotal).toBe(15_000);
      expect(res.total).toBe(15_000);
    });

    it("should apply percentage surcharge special policy", () => {
      const policy: SpecialPolicyModel = {
        active: true,
        modifies: "SURCHARGE",
        name: "Peak Hours Surcharge",
        operation: "PERCENTAGE",
        valueToModify: 20,
      };

      const res = RateService.simulateCalculation({
        basePrice: 5000,
        durationInMinutes: 60,
        specialPolicy: policy,
        timeUnit: "HOURS",
      });

      expect(res.unitsCalculated).toBe(1);
      expect(res.subtotal).toBe(5000);
      expect(res.discountOrSurcharge).toBe(1000);
      expect(res.total).toBe(6000);
    });

    it("should apply discount policy", () => {
      const policy: SpecialPolicyModel = {
        active: true,
        modifies: "DISCOUNT",
        name: "Zone Discount",
        operation: "PERCENTAGE",
        valueToModify: 10,
      };

      const res = RateService.simulateCalculation({
        basePrice: 10_000,
        durationInMinutes: 1440,
        specialPolicy: policy,
        timeUnit: "DAYS",
      });

      expect(res.unitsCalculated).toBe(1);
      expect(res.subtotal).toBe(10_000);
      expect(res.discountOrSurcharge).toBe(-1000);
      expect(res.total).toBe(9000);
    });

    it("should calculate minute-based pricing correctly", () => {
      const res = RateService.simulateCalculation({
        basePrice: 100,
        durationInMinutes: 45,
        timeUnit: "MINUTES",
      });

      expect(res.unitsCalculated).toBe(45);
      expect(res.subtotal).toBe(4500);
      expect(res.total).toBe(4500);
    });
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
});
