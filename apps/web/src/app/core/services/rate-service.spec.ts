import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ResponseIterableRatesDto } from "@core/api/generated/models";
import {
  ParkingLotsService,
  RatesService,
  TenantsService,
} from "@core/api/generated/services";
import type { UserModel } from "@core/models/user.model";
import { AuthService } from "@core/services/auth-service";
import { UserService } from "@core/services/user/user-service";
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
  let accessTokenSignal: ReturnType<typeof signal<string | null>>;
  let currentUserSignal: ReturnType<typeof signal<UserModel | null>>;

  const makeUser = (tenantId: string): UserModel => ({
    contactInfo: "3001234567",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    email: `user@${tenantId}.com`,
    fullName: "Test User",
    id: `user-${tenantId}`,
    role: "OWNER",
    tenant: {
      companyName: `Company ${tenantId}`,
      id: tenantId,
    },
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  });

  beforeEach(() => {
    accessTokenSignal = signal<string | null>("token-tenant-a");
    currentUserSignal = signal<UserModel | null>(makeUser("tenant-a"));

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
        {
          provide: AuthService,
          useValue: { accessTokenSignal: accessTokenSignal.asReadonly() },
        },
        {
          provide: UserService,
          useValue: { currentUser: currentUserSignal.asReadonly() },
        },
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
            valueToModify: 18_000,
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

  describe("Tenant & Session Cache Isolation", () => {
    it("should clear cached special policies on logout and fetch tenant B policies on re-login", async () => {
      const tenantAResponse = {
        data: [
          {
            active: true,
            id: "sp-a",
            modifies: "SURCHARGE" as const,
            name: "Tenant A Policy",
            operation: "SET" as const,
            valueToModify: 10_000,
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };
      const tenantBResponse = {
        data: [
          {
            active: true,
            id: "sp-b",
            modifies: "DISCOUNT" as const,
            name: "Tenant B Policy",
            operation: "PERCENTAGE" as const,
            valueToModify: 20,
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };

      /* SAFETY: Mock response payload for unit test */
      tenantsServiceSpy.showSpecialPoliciesByTenant.mockReturnValueOnce(
        of(tenantAResponse as never)
      );
      const policiesA = await firstValueFrom(service.loadSpecialPolicies());
      expect(policiesA.map((p) => p.name)).toEqual(["Tenant A Policy"]);
      expect(
        tenantsServiceSpy.showSpecialPoliciesByTenant
      ).toHaveBeenCalledTimes(1);

      // Logout clears session
      accessTokenSignal.set(null);
      TestBed.flushEffects();
      expect(service.specialPolicies()).toEqual([]);
      expect(service.ratesByParking()).toEqual({});

      // Re-login as Tenant B
      currentUserSignal.set(makeUser("tenant-b"));
      accessTokenSignal.set("token-tenant-b");
      TestBed.flushEffects();

      /* SAFETY: Mock response payload for unit test */
      tenantsServiceSpy.showSpecialPoliciesByTenant.mockReturnValueOnce(
        of(tenantBResponse as never)
      );
      const policiesB = await firstValueFrom(service.loadSpecialPolicies());
      expect(policiesB.map((p) => p.name)).toEqual(["Tenant B Policy"]);
      expect(
        tenantsServiceSpy.showSpecialPoliciesByTenant
      ).toHaveBeenCalledTimes(2);
    });

    it("should clear cached rates and special policies when tenant changes without explicit logout", async () => {
      const ratesAResponse: ResponseIterableRatesDto = {
        data: [
          {
            createdAt: "2024-01-01T00:00:00Z",
            description: "Tenant A Rate",
            id: "rate-a",
            minChargeTimeMinutes: "15",
            name: "Rate A",
            pricePerUnit: 3000,
            timeUnit: "HOURS",
            vehicleType: "CAR",
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };
      const ratesBResponse: ResponseIterableRatesDto = {
        data: [
          {
            createdAt: "2024-01-01T00:00:00Z",
            description: "Tenant B Rate",
            id: "rate-b",
            minChargeTimeMinutes: "15",
            name: "Rate B",
            pricePerUnit: 6000,
            timeUnit: "HOURS",
            vehicleType: "CAR",
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      };

      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        of(ratesAResponse)
      );
      const ratesA = await firstValueFrom(
        service.getRatesByParkingId("parking-1")
      );
      expect(ratesA[0].name).toBe("Rate A");

      currentUserSignal.set(makeUser("tenant-b"));
      accessTokenSignal.set("token-tenant-b");

      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        of(ratesBResponse)
      );
      const ratesB = await firstValueFrom(
        service.getRatesByParkingId("parking-1")
      );
      expect(ratesB[0].name).toBe("Rate B");
      expect(parkingLotsServiceSpy.showRatesByParkingId).toHaveBeenCalledTimes(
        2
      );
    });
  });
});
