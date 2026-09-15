import "@angular/compiler";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from "@angular/router";
import type { RateModel, SpecialPolicyModel } from "@core/models/rate.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { RatesPageComponent } from "./rates-page";

describe("RatesPageComponent", () => {
  let component: RatesPageComponent;
  let fixture: ComponentFixture<RatesPageComponent>;
  let router: Router;

  const mockParkingLots = signal([
    {
      address: {
        city: "Bogotá",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Cll 100",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6, longitude: -74 },
      createdAt: "",
      currency: "COP",
      id: "parking-1",
      name: "Parqueadero Central",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 50,
      updatedAt: "",
    },
  ]);

  const mockRatesByParking = signal<Record<string, RateModel[]>>({
    "parking-1": [
      {
        createdAt: "",
        description: "Tarifa estándar carros",
        id: "rate-1",
        minChargeTimeMinutes: 15,
        name: "Carro Estándar",
        parkingId: "parking-1",
        pricePerUnit: 5000,
        timeUnit: "HOURS",
        updatedAt: "",
        vehicleType: "CAR",
      },
    ],
  });

  const mockSpecialPolicies = signal<SpecialPolicyModel[]>([]);

  const mockRateService = {
    calculatePrice: vi.fn().mockReturnValue(of({ calculatedPrice: 0 })),
    deleteRate: vi.fn().mockReturnValue(of()),
    getRatesByParkingId: vi.fn().mockReturnValue(of([])),
    loadSpecialPolicies: vi.fn().mockReturnValue(of([])),
    ratesByParking: mockRatesByParking,
    specialPolicies: mockSpecialPolicies,
  };

  const mockParkingService = {
    parkingLots: mockParkingLots,
  };

  const mockToastService = {
    showToast: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatesPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ parkingId: "parking-1" })),
          },
        },
        { provide: RateService, useValue: mockRateService },
        { provide: ParkingService, useValue: mockParkingService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockReturnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create RatesPageComponent instance", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-page-header with title, subtitle and actions", () => {
    const header = fixture.nativeElement.querySelector("app-page-header");
    expect(header).toBeTruthy();
    expect(header.textContent).toContain("Tarifas");
    expect(header.textContent).toContain(
      "Gestión de esquemas tarifarios, precios base y simulación en tiempo real"
    );

    const actions = header.querySelector("[actions]");
    expect(actions).toBeTruthy();
    expect(actions.textContent).toContain("Nueva tarifa");
  });

  it("should navigate to create rate when clicking nueva tarifa", () => {
    component.createRate();
    expect(router.navigate).toHaveBeenCalledWith([
      "/app/parking-lots/parking-1/rates/new",
    ]);
  });

  it("should switch tabs between rates, calculator and policies", () => {
    expect(component.activeTab()).toBe("rates");
    expect(fixture.nativeElement.querySelector("app-rates-list")).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector("app-rate-calculator")
    ).toBeFalsy();

    component.activeTab.set("calculator");
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("app-rate-calculator")
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector("app-rates-list")).toBeFalsy();

    component.activeTab.set("policies");
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("app-special-policies-config")
    ).toBeTruthy();
  });
});
