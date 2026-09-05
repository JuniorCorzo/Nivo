import "@angular/compiler";
import { Injector, runInInjectionContext, signal } from "@angular/core";
import type { UpsertParkingLotsModel } from "@core/models/parking.model";
import { ColombiaService } from "@core/service/colombia-service";
import { ParkingService } from "@core/services/parking-service";
import { of } from "rxjs";

import { ParkingFormFacade } from "./parking-form.facade";

describe("ParkingFormFacade", () => {
  let facade: ParkingFormFacade;
  let mockColombiaService: Partial<ColombiaService>;
  let mockParkingService: jasmine.SpyObj<ParkingService>;

  const mockDepartamentsSignal = signal<string[]>([
    "Antioquia",
    "Cundinamarca",
  ]);

  beforeEach(() => {
    mockColombiaService = {
      departaments: mockDepartamentsSignal,
      getCitiesByDepartmentName: jasmine
        .createSpy("getCitiesByDepartmentName")
        .and.callFake((dept: string) => {
          if (dept === "Cundinamarca") {
            return ["Bogotá", "Soacha"];
          }
          if (dept === "Antioquia") {
            return ["Medellín", "Envigado"];
          }
          return [];
        }),
    };

    mockParkingService = jasmine.createSpyObj<ParkingService>(
      "ParkingService",
      ["deleteSlotGroup", "create", "update", "getUpsertById"]
    );
    mockParkingService.deleteSlotGroup.and.returnValue(of());

    const injector = Injector.create({
      providers: [
        ParkingFormFacade,
        {
          provide: ColombiaService,
          useValue: mockColombiaService,
        },
        {
          provide: ParkingService,
          useValue: mockParkingService,
        },
      ],
    });

    facade = runInInjectionContext(injector, () => new ParkingFormFacade());
  });

  it("should create facade instance with default values", () => {
    expect(facade).toBeTruthy();
    expect(facade.mode()).toBe("create");
    expect(facade.parkingId()).toBeNull();
    expect(facade.isSubmitting()).toBeFalse();
    expect(facade.isMapPlaceholderVisible()).toBeTrue();
    expect(facade.slots().length).toBe(0);
  });

  describe("Mode and Titles", () => {
    it("should update mode and computed texts for edit mode", () => {
      facade.setMode("edit", "lot-123");
      expect(facade.mode()).toBe("edit");
      expect(facade.parkingId()).toBe("lot-123");
      expect(facade.submitButtonText()).toBeTruthy();
    });

    it("should update mode and computed texts for create mode", () => {
      facade.setMode("create");
      expect(facade.mode()).toBe("create");
      expect(facade.parkingId()).toBeNull();
      expect(facade.submitButtonText()).toBeTruthy();
    });
  });

  describe("State and Cities", () => {
    it("should update cities when onStateSelected is called", () => {
      facade.onStateSelected("Cundinamarca");
      expect(facade.cities()).toEqual(["Bogotá", "Soacha"]);
    });

    it("should clear cities if state is not found", () => {
      facade.onStateSelected("Desconocido");
      expect(facade.cities()).toEqual([]);
    });
  });

  describe("Coordinates and Map Placeholder", () => {
    it("should update coordinates and hide map placeholder on onCoordinatesChange", () => {
      facade.onCoordinatesChange({ latitude: 4.6097, longitude: -74.0817 });
      expect(facade.selectedCoordinates()).toEqual({
        latitude: 4.6097,
        longitude: -74.0817,
      });
      expect(facade.isMapPlaceholderVisible()).toBeFalse();
      expect(facade.isSelectedCoordinates()).toBeTrue();
      expect(facade.coordinates().length).toBe(2);
    });

    it("should hide map placeholder on dismissMapPlaceholder", () => {
      facade.dismissMapPlaceholder();
      expect(facade.isMapPlaceholderVisible()).toBeFalse();
    });
  });

  describe("Slots Management", () => {
    it("should add a new empty slot", () => {
      facade.addSlot();
      expect(facade.slots().length).toBe(1);
      expect(facade.slots()[0]).toEqual({
        count: 0,
        prefix: "",
        type: "CAR",
        zone: "",
      });
    });

    it("should update slot field", () => {
      facade.addSlot();
      facade.updateSlot(0, "count", 25);
      facade.updateSlot(0, "prefix", "B");
      facade.updateSlot(0, "zone", "Norte");

      expect(facade.slots()[0].count).toBe(25);
      expect(facade.slots()[0].prefix).toBe("B");
      expect(facade.slots()[0].zone).toBe("Norte");
    });

    it("should remove slot without deleting on server in create mode", () => {
      facade.addSlot();
      facade.addSlot();
      facade.removeSlot(0);

      expect(facade.slots().length).toBe(1);
      expect(mockParkingService.deleteSlotGroup).not.toHaveBeenCalled();
    });

    it("should delete slot on server if in edit mode and slot existed originally", () => {
      const initialSlot = {
        count: 10,
        prefix: "A",
        type: "CAR" as const,
        zone: "Z1",
      };
      facade.loadModel({
        address: {
          city: "Bogotá",
          country: "Colombia",
          state: "Cundinamarca",
          street: "Cll 1",
          zipCode: "110111",
        },
        coordinates: { latitude: 4.6, longitude: -74 },
        currency: "COP",
        name: "Test Parking",
        operatingHours: {
          closeTime: "22:00:00-05:00",
          openTime: "06:00:00-05:00",
        },
        slots: [initialSlot],
        timezone: "UTC-05:00",
      });
      facade.setMode("edit", "lot-1");

      facade.removeSlot(0);
      expect(facade.slots().length).toBe(0);
      expect(mockParkingService.deleteSlotGroup).toHaveBeenCalledWith(
        "lot-1",
        initialSlot
      );
    });
  });

  describe("Load and Build Submit Model", () => {
    const mockModel: UpsertParkingLotsModel = {
      address: {
        city: "Bogotá",
        country: "Colombia",
        state: "Cundinamarca",
        street: "Calle 100 # 15-20",
        zipCode: "110111",
      },
      coordinates: { latitude: 4.6097, longitude: -74.0817 },
      currency: "COP",
      name: "Parqueadero Central",
      operatingHours: {
        closeTime: "20:00:00-05:00",
        openTime: "08:00:00-05:00",
      },
      slots: [{ count: 30, prefix: "A", type: "CAR", zone: "Norte" }],
      timezone: "UTC-05:00",
    };

    it("should load model data into form and signals", () => {
      facade.loadModel(mockModel);

      expect(facade.form.name().value()).toBe("Parqueadero Central");
      expect(facade.form.address.city().value()).toBe("Bogotá");
      expect(facade.form.address.street().value()).toBe("Calle 100 # 15-20");
      expect(facade.form.operatingHours.openTime().value()).toBe("08:00");
      expect(facade.form.operatingHours.closeTime().value()).toBe("20:00");
      expect(facade.selectedCoordinates()).toEqual({
        latitude: 4.6097,
        longitude: -74.0817,
      });
      expect(facade.slots().length).toBe(1);
    });

    it("should build submit model with formatted operating hours and coordinates", () => {
      facade.loadModel(mockModel);
      facade.addSlot();
      facade.updateSlot(1, "count", 15);
      facade.updateSlot(1, "type", "MOTORCYCLE");

      const submitData = facade.buildSubmitModel();
      expect(submitData.name).toBe("Parqueadero Central");
      expect(submitData.operatingHours.openTime).toBe("08:00:00-05:00");
      expect(submitData.operatingHours.closeTime).toBe("20:00:00-05:00");
      expect(submitData.coordinates).toEqual({
        latitude: 4.6097,
        longitude: -74.0817,
      });
      expect(submitData.slots?.length).toBe(2);
    });

    it("should update isSubmitting state", () => {
      facade.setSubmitting(true);
      expect(facade.isSubmitting()).toBeTrue();
      facade.setSubmitting(false);
      expect(facade.isSubmitting()).toBeFalse();
    });
  });
});
