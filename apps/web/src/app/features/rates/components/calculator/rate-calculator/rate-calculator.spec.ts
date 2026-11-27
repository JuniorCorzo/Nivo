import "@angular/compiler";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { RateModel, SimulateRateResult } from "@core/models/rate.model";
import { RateService } from "@core/services/rate-service";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { Subject, of, throwError } from "rxjs";

import {
  MAX_SIMULATION_MINUTES,
  RateCalculatorComponent,
} from "./rate-calculator";

describe("RateCalculatorComponent", () => {
  let component: RateCalculatorComponent;
  let fixture: ComponentFixture<RateCalculatorComponent>;
  let simulateRateSpy: ReturnType<typeof vi.fn>;

  const mockResult: SimulateRateResult = {
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

  beforeEach(async () => {
    vi.useFakeTimers();
    simulateRateSpy = vi.fn().mockReturnValue(of(mockResult));

    await TestBed.configureTestingModule({
      imports: [RateCalculatorComponent],
      providers: [
        {
          provide: RateService,
          useValue: {
            simulateRate: simulateRateSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RateCalculatorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate initial simulation via RateService and render preview", () => {
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);

    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(simulateRateSpy).toHaveBeenCalledWith({
      gracePeriodMinutes: 15,
      minutesStayed: 90,
      pricePerUnit: 4000,
      timeUnit: "HOURS",
      vehicleType: "CAR",
    });
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.simulation()).toEqual(mockResult);

    const previewText = fixture.nativeElement.textContent;
    expect(previewText).toContain("Simulador Nivo");
    expect(previewText).toContain("Tarifa CAR (2 Horas * 4000 COP/Horas)");
    expect(previewText).toContain("IVA (19%)");
    expect(previewText).toContain("9,520");
  });

  it("should show loading state while waiting for simulation response", () => {
    const pending$ = new Subject<SimulateRateResult>();
    simulateRateSpy.mockReturnValue(pending$.asObservable());

    fixture.detectChanges();
    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      APP_TEXTS.rates.preview.loadingLabel
    );

    pending$.next(mockResult);
    pending$.complete();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.simulation()).toEqual(mockResult);
  });

  it("should handle simulation error and recover on subsequent parameter change", () => {
    simulateRateSpy.mockReturnValueOnce(
      throwError(() => new Error("Server error"))
    );

    fixture.detectChanges();
    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.simulation()).toBeNull();
    expect(component.error()).toBe(APP_TEXTS.rates.preview.errorFallback);

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain(APP_TEXTS.rates.preview.errorFallback);

    simulateRateSpy.mockReturnValueOnce(
      of({
        ...mockResult,
        total: 4760,
      })
    );

    const minutesInput = document.createElement("input");
    minutesInput.value = "60";
    component.onVehicleTypeChange("MOTORCYCLE");
    component.onMinutesStayedInput({
      target: minutesInput,
    } as unknown as Event);
    fixture.detectChanges();
    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 15,
      minutesStayed: 60,
      pricePerUnit: 4000,
      timeUnit: "HOURS",
      vehicleType: "MOTORCYCLE",
    });
    expect(component.error()).toBeNull();
    expect(component.simulation()?.total).toBe(4760);
  });

  it("should send undefined pricePerUnit when price input is cleared", () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    const priceInput = document.createElement("input");
    priceInput.value = "";
    component.onPricePerUnitInput({
      target: priceInput,
    } as unknown as Event);
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 15,
      minutesStayed: 90,
      pricePerUnit: undefined,
      timeUnit: "HOURS",
      vehicleType: "CAR",
    });
  });

  it("should clamp minutesStayed to MAX_SIMULATION_MINUTES (525600) for huge inputs", () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    const minutesInput = document.createElement("input");
    minutesInput.value = "1e17";
    component.onMinutesStayedInput({
      target: minutesInput,
    } as unknown as Event);
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    expect(component.minutesStayed()).toBe(MAX_SIMULATION_MINUTES);
    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 15,
      minutesStayed: MAX_SIMULATION_MINUTES,
      pricePerUnit: 4000,
      timeUnit: "HOURS",
      vehicleType: "CAR",
    });
  });

  it("should pre-populate from configured parking and rates and switch vehicle rates", () => {
    const parking: ParkingLotListItemModel = {
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
      gracePeriodMinutes: 10,
      gracePeriodPrice: 1200,
      id: "parking-1",
      ivaRate: 0.19,
      name: "Parqueadero Central",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 50,
      updatedAt: "",
    };

    const rates: RateModel[] = [
      {
        createdAt: "",
        description: "Tarifa carros",
        id: "rate-car",
        minChargeTimeMinutes: 30,
        name: "Carro Estándar",
        parkingId: "parking-1",
        pricePerUnit: 5500,
        specialPolicy: {
          active: true,
          id: "pol-1",
          modifies: "DISCOUNT",
          name: "Descuento 10%",
          operation: "PERCENTAGE",
          valueToModify: 10,
        },
        timeUnit: "HOURS",
        updatedAt: "",
        vehicleType: "CAR",
      },
      {
        createdAt: "",
        description: "Tarifa motos",
        id: "rate-moto",
        minChargeTimeMinutes: 15,
        name: "Moto Estándar",
        parkingId: "parking-1",
        pricePerUnit: 2500,
        timeUnit: "MINUTES",
        updatedAt: "",
        vehicleType: "MOTORCYCLE",
      },
    ];

    fixture.componentRef.setInput("parkingId", "parking-1");
    fixture.componentRef.setInput("parking", parking);
    fixture.componentRef.setInput("rates", rates);
    fixture.detectChanges();
    vi.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 10,
      gracePeriodPrice: 1200,
      ivaRate: 0.19,
      minChargeTimeMinutes: 30,
      minutesStayed: 90,
      pricePerUnit: 5500,
      rateName: "Carro Estándar",
      specialPolicy: {
        active: true,
        modifies: "DISCOUNT",
        name: "Descuento 10%",
        operation: "PERCENTAGE",
        valueToModify: 10,
      },
      timeUnit: "HOURS",
      vehicleType: "CAR",
    });

    const contextText = fixture.nativeElement.querySelector(
      '[data-testid="parking-rate-context"]'
    )?.textContent;
    expect(contextText).toContain("Parqueadero Central");
    expect(contextText).toContain("30 min");
    expect(contextText).toContain("Descuento 10%");

    component.onVehicleTypeChange("MOTORCYCLE");
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 10,
      gracePeriodPrice: 1200,
      ivaRate: 0.19,
      minChargeTimeMinutes: 15,
      minutesStayed: 90,
      pricePerUnit: 2500,
      rateName: "Moto Estándar",
      timeUnit: "MINUTES",
      vehicleType: "MOTORCYCLE",
    });

    component.onVehicleTypeChange("BIKE");
    fixture.detectChanges();
    vi.advanceTimersByTime(250);

    expect(fixture.nativeElement.textContent).toContain(
      APP_TEXTS.rates.calculator.noConfiguredRateWarning
    );
    expect(simulateRateSpy).toHaveBeenLastCalledWith({
      gracePeriodMinutes: 10,
      gracePeriodPrice: 1200,
      ivaRate: 0.19,
      minutesStayed: 90,
      pricePerUnit: undefined,
      timeUnit: "MINUTES",
      vehicleType: "BIKE",
    });
  });
});
