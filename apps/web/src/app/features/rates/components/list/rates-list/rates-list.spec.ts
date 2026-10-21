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

  it("should render search bar and vehicle filter", () => {
    const searchInput = fixture.nativeElement.querySelector("nv-input");
    const vehicleSelect = fixture.nativeElement.querySelector("nv-select");
    expect(searchInput).toBeTruthy();
    expect(vehicleSelect).toBeTruthy();
  });

  it("should filter rates by search query", () => {
    expect(component.filteredRates().length).toBe(1);

    component.searchQuery.set("Moto");
    expect(component.filteredRates().length).toBe(0);

    component.searchQuery.set("Carro");
    expect(component.filteredRates().length).toBe(1);
  });

  it("should filter rates by vehicle type", () => {
    component.vehicleFilter.set("BIKE");
    expect(component.filteredRates().length).toBe(0);

    component.vehicleFilter.set("CAR");
    expect(component.filteredRates().length).toBe(1);
  });

  it("should navigate to edit rate", () => {
    component.editRate("rate-1");
    expect(router.navigate).toHaveBeenCalledWith([
      "/app/parking-lots/parking-1/rates/rate-1/edit",
    ]);
  });
});
