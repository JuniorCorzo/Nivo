import "@angular/compiler";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
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

import { RateListComponent } from "./rates-list";

describe("RateListComponent", () => {
  let component: RateListComponent;
  let fixture: ComponentFixture<RateListComponent>;
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
    deleteRate: vi.fn().mockReturnValue(of(undefined)),
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
      imports: [RateListComponent],
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

    fixture = TestBed.createComponent(RateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-page-header with title, subtitle, breadcrumbs and actions", () => {
    const header = fixture.nativeElement.querySelector("app-page-header");
    expect(header).toBeTruthy();
    expect(header.textContent).toContain("Tarifas");
    expect(header.textContent).toContain(
      "Gestión de esquemas tarifarios, precios base y simulación en tiempo real"
    );

    const breadcrumb = header.querySelector(
      '[data-testid="page-header-breadcrumb"]'
    );
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb?.textContent).toContain("Parqueaderos");
    expect(breadcrumb?.textContent).toContain("Parqueadero Central");
    expect(breadcrumb?.textContent).toContain("Tarifas");

    const actions = header.querySelector("[actions]");
    expect(actions).toBeTruthy();
    expect(actions.textContent).toContain("Nueva tarifa");
    expect(actions.textContent).toContain("Volver al parqueadero");
  });
});
