import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import type { RateModel } from "@core/models/rate.model";
import { ParkingService } from "@core/services/parking-service";
import { RateService } from "@core/services/rate-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";

import { RateFormFacade } from "./rate-form.facade";

describe("RateFormFacade", () => {
  let facade: RateFormFacade;
  let rateServiceSpy: jasmine.SpyObj<RateService>;
  let parkingServiceSpy: jasmine.SpyObj<ParkingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    rateServiceSpy = jasmine.createSpyObj(
      "RateService",
      [
        "createRate",
        "updateRate",
        "getRateById",
        "getRatesByParkingId",
        "loadSpecialPolicies",
        "specialPolicies",
      ],
      {
        specialPolicies: () => [],
      }
    );
    const mockLot: ParkingLotListItemModel = {
      address: {
        city: "Bogota",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 1",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6, longitude: -74 },
      createdAt: "",
      currency: "COP",
      id: "parking-1",
      name: "Centro",
      occuppationRate: 0,
      ownerName: "Admin",
      slotDistribution: [],
      totalCapacity: 100,
      updatedAt: "",
    };
    parkingServiceSpy = jasmine.createSpyObj("ParkingService", [], {
      parkingLots: () => [mockLot],
    });

    toastSpy = jasmine.createSpyObj("ToastService", ["showToast"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    TestBed.configureTestingModule({
      providers: [
        RateFormFacade,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ parkingId: "parking-1" })),
          },
        },
        { provide: RateService, useValue: rateServiceSpy },
        { provide: ParkingService, useValue: parkingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    facade = TestBed.inject(RateFormFacade);
  });

  it("should initialize in create mode", () => {
    expect(facade.mode()).toBe("create");
    expect(facade.parkingId()).toBe("parking-1");
  });

  it("should validate form correctly", () => {
    facade.form.name.set("Tarifa Carro");
    facade.form.description.set("Tarifa por hora");
    facade.form.pricePerUnit.set(3000);
    facade.form.minChargeTimeMinutes.set(10);
    expect(facade.isValid()).toBe(true);

    facade.form.description.set("");
    expect(facade.isValid()).toBe(false);

    facade.form.description.set("Tarifa por hora");
    facade.form.pricePerUnit.set(0);
    expect(facade.isValid()).toBe(false);
  });

  it("should calculate live simulation correctly via computed signal", () => {
    const sim = facade.simulation();
    expect(sim.total).toBe(10_000);
  });

  it("should submit create rate using mapper payload", () => {
    const mockCreatedRate: RateModel = {
      createdAt: "",
      description: "",
      id: "new-rate",
      minChargeTimeMinutes: 15,
      name: "Tarifa Plena",
      parkingId: "parking-1",
      pricePerUnit: 5000,
      timeUnit: "HOURS",
      updatedAt: "",
      vehicleType: "CAR",
    };
    rateServiceSpy.createRate.and.returnValue(of(mockCreatedRate));

    facade.form.name.set("Tarifa Plena");
    facade.form.description.set("Tarifa estándar");
    facade.form.pricePerUnit.set(5000);
    facade.form.minChargeTimeMinutes.set(15);

    facade.submit();

    expect(rateServiceSpy.createRate).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: "Tarifa estándar",
        minChargeTimeMinutes: 15,
        name: "Tarifa Plena",
        parkingId: "parking-1",
        pricePerUnit: 5000,
      })
    );
    expect(toastSpy.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: "success" })
    );
  });
});
