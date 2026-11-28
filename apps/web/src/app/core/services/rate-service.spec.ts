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
import { firstValueFrom, of, Subject } from "rxjs";

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
  let sessionGenerationSignal: ReturnType<typeof signal<number>>;
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
    sessionGenerationSignal = signal<number>(1);
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
          useValue: {
            accessTokenSignal: accessTokenSignal.asReadonly(),
            sessionGenerationSignal: sessionGenerationSignal.asReadonly(),
          },
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

    it("should ignore in-flight getRatesByParkingId from Tenant A that resolves after switching to Tenant B", async () => {
      const tenantARates$ = new Subject<ResponseIterableRatesDto>();
      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        tenantARates$.asObservable()
      );

      const receivedA: unknown[] = [];
      service.getRatesByParkingId("parking-1").subscribe((rates) => {
        receivedA.push(rates);
      });

      // Logout and switch to Tenant B while Tenant A request is in flight
      accessTokenSignal.set(null);
      currentUserSignal.set(null);
      TestBed.flushEffects();

      currentUserSignal.set(makeUser("tenant-b"));
      accessTokenSignal.set("token-tenant-b");
      TestBed.flushEffects();

      // Tenant A's stale in-flight response arrives now
      tenantARates$.next({
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
      });
      tenantARates$.complete();

      expect(receivedA).toEqual([]);
      expect(service.ratesByParking()).toEqual({});

      // Tenant B must fetch from API, not read Tenant A's data from cache
      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        of({
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
        })
      );

      const ratesB = await firstValueFrom(
        service.getRatesByParkingId("parking-1")
      );
      expect(ratesB.map((r) => r.name)).toEqual(["Rate B"]);
      expect(parkingLotsServiceSpy.showRatesByParkingId).toHaveBeenCalledTimes(
        2
      );
    });

    it("should ignore in-flight loadSpecialPolicies from Tenant A that resolves after logout and re-login", async () => {
      const tenantAPolicies$ = new Subject<never>();
      tenantsServiceSpy.showSpecialPoliciesByTenant.mockReturnValueOnce(
        tenantAPolicies$.asObservable()
      );

      const receivedA: unknown[] = [];
      service.loadSpecialPolicies().subscribe((policies) => {
        receivedA.push(policies);
      });

      // Logout and re-login (even if same tenant, sessionGeneration incremented)
      accessTokenSignal.set(null);
      currentUserSignal.set(null);
      sessionGenerationSignal.update((n) => n + 1);
      TestBed.flushEffects();

      currentUserSignal.set(makeUser("tenant-a"));
      sessionGenerationSignal.update((n) => n + 1);
      accessTokenSignal.set("token-tenant-a-new");
      TestBed.flushEffects();

      // Stale response from previous session arrives
      tenantAPolicies$.next({
        data: [
          {
            active: true,
            id: "sp-stale",
            modifies: "SURCHARGE",
            name: "Stale Policy",
            operation: "SET",
            valueToModify: 9999,
          },
        ],
        message: "Success",
        status: "OK",
        timestamp: "2024-01-01T00:00:00Z",
      } as never);
      tenantAPolicies$.complete();

      expect(receivedA).toEqual([]);
      expect(service.specialPolicies()).toEqual([]);
    });

    it("should not mutate Tenant B cache when an in-flight createSpecialPolicy from Tenant A resolves after tenant switch", async () => {
      const createA$ = new Subject<never>();
      tenantsServiceSpy.createAtSpecialPolicies.mockReturnValueOnce(
        createA$.asObservable()
      );

      service
        .createSpecialPolicy({
          modifies: "SURCHARGE",
          name: "Tenant A Created",
          operation: "SET",
          valueToModify: 5000,
        })
        .subscribe();

      // Switch to Tenant B before response arrives (without flushing effects to also test synchronous guard)
      currentUserSignal.set(makeUser("tenant-b"));
      accessTokenSignal.set("token-tenant-b");

      createA$.next({
        data: {
          active: true,
          id: "sp-a-created",
          modifies: "SURCHARGE",
          name: "Tenant A Created",
          operation: "SET",
          valueToModify: 5000,
        },
        message: "Created",
        status: "CREATED",
        timestamp: "2024-01-01T00:00:00Z",
      } as never);
      createA$.complete();

      expect(service.specialPolicies()).toEqual([]);
    });

    it("should NOT clear cache or abort in-flight requests on routine JWT token refresh", async () => {
      const rates$ = new Subject<ResponseIterableRatesDto>();
      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        rates$.asObservable()
      );

      let resolvedRates: unknown[] | undefined;
      service.getRatesByParkingId("parking-1").subscribe((rates) => {
        resolvedRates = rates;
      });

      // Routine JWT rotation: accessToken changes, sessionGeneration & tenant stay the same
      accessTokenSignal.set("token-tenant-a-refreshed");
      TestBed.flushEffects();

      rates$.next({
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
      });
      rates$.complete();

      expect(resolvedRates).toHaveLength(1);
      expect(service.ratesByParking()["parking-1"]).toHaveLength(1);
    });

    it("should preserve in-flight requests and cache when scope upgrades from session:<N> to session:<N>:tenant:<id>", async () => {
      // Simulate initial deep-link load before currentUser resolves
      currentUserSignal.set(null);
      TestBed.flushEffects();

      const rates$ = new Subject<ResponseIterableRatesDto>();
      parkingLotsServiceSpy.showRatesByParkingId.mockReturnValueOnce(
        rates$.asObservable()
      );

      let resolvedRates: unknown[] | undefined;
      service.getRatesByParkingId("parking-1").subscribe((rates) => {
        resolvedRates = rates;
      });

      // GET /users/me resolves for the same sessionGeneration
      currentUserSignal.set(makeUser("tenant-a"));
      TestBed.flushEffects();

      rates$.next({
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
      });
      rates$.complete();

      expect(resolvedRates).toHaveLength(1);
      expect(service.ratesByParking()["parking-1"]).toHaveLength(1);
    });
  });
});
