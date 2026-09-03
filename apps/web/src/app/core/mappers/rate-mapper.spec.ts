import type { RatesDto, SpecialPoliciesInfo } from "@core/api/generated/models";
import type { CreateRateModel, UpdateRateModel } from "@core/models/rate.model";

import {
  mapFormToCreateRateModel,
  mapFormToUpdateRateModel,
  mapToCreateRateDto,
  mapToRateModel,
  mapToSpecialPolicyModel,
  mapToUpdateRateDto,
} from "./rate.mapper";

describe("RateMapper", () => {
  describe("mapToSpecialPolicyModel", () => {
    it("should return undefined when input is null or undefined", () => {
      expect(mapToSpecialPolicyModel(null)).toBeUndefined();
      expect(mapToSpecialPolicyModel()).toBeUndefined();
    });

    it("should map SpecialPoliciesInfo to SpecialPolicyModel", () => {
      const dto: SpecialPoliciesInfo = {
        active: true,
        id: "policy-1",
        modifies: "SURCHARGE",
        name: "VIP Surcharge",
        operation: "PERCENTAGE",
        valueToModify: 20,
      };

      const result = mapToSpecialPolicyModel(dto);

      expect(result).toEqual({
        active: true,
        id: "policy-1",
        modifies: "SURCHARGE",
        name: "VIP Surcharge",
        operation: "PERCENTAGE",
        valueToModify: 20,
      });
    });
  });

  describe("mapToRateModel", () => {
    it("should map RatesDto to RateModel with nested special policy", () => {
      const dto: RatesDto = {
        createdAt: "2026-01-01T00:00:00Z",
        description: "Standard car rate",
        id: "rate-1",
        minChargeTimeMinutes: "15",
        name: "Car Hourly",
        parking: { id: "parking-1" },
        pricePerUnit: 5000,
        specialPolicy: {
          active: true,
          id: "sp-1",
          modifies: "DISCOUNT",
          name: "Night Discount",
          operation: "PERCENTAGE",
          valueToModify: 10,
        },
        timeUnit: "HOURS",
        updatedAt: "2026-01-02T00:00:00Z",
        vehicleType: "CAR",
      };

      const result = mapToRateModel(dto);

      expect(result.id).toBe("rate-1");
      expect(result.name).toBe("Car Hourly");
      expect(result.vehicleType).toBe("CAR");
      expect(result.timeUnit).toBe("HOURS");
      expect(result.pricePerUnit).toBe(5000);
      expect(result.minChargeTimeMinutes).toBe(15);
      expect(result.parkingId).toBe("parking-1");
      expect(result.specialPolicy?.name).toBe("Night Discount");
    });

    it("should fallback defaults when optional fields are missing", () => {
      const dto: RatesDto = {};
      const result = mapToRateModel(dto);

      expect(result.id).toBe("");
      expect(result.vehicleType).toBe("CAR");
      expect(result.timeUnit).toBe("HOURS");
      expect(result.pricePerUnit).toBe(0);
      expect(result.minChargeTimeMinutes).toBe(0);
      expect(result.specialPolicy).toBeUndefined();
    });
  });

  describe("mapToCreateRateDto", () => {
    it("should map CreateRateModel to CreateRate DTO", () => {
      const model: CreateRateModel = {
        description: "Per minute charge",
        minChargeTimeMinutes: 5,
        name: "Bike Minute",
        parkingId: "parking-123",
        pricePerUnit: 100,
        specialPolicyId: "sp-99",
        timeUnit: "MINUTES",
        vehicleType: "BIKE",
      };

      const dto = mapToCreateRateDto(model);

      expect(dto.parkingLotId).toBe("parking-123");
      expect(dto.name).toBe("Bike Minute");
      expect(dto.vehicleType).toBe("BIKE");
      expect(dto.timeUnit).toBe("MINUTES");
      expect(dto.pricePerUnit).toBe(100);
      expect(dto.minChargeTimeMinutes).toBe("5");
      expect(dto.specialPolicyId).toBe("sp-99");
    });
  });

  describe("mapToUpdateRateDto", () => {
    it("should map UpdateRateModel to UpdateRate DTO", () => {
      const model: UpdateRateModel = {
        id: "rate-1",
        minChargeTimeMinutes: 10,
        name: "Updated Rate",
        pricePerUnit: 2500,
        timeUnit: "HOURS",
        vehicleType: "MOTORCYCLE",
      };

      const dto = mapToUpdateRateDto(model);

      expect(dto.id).toBe("rate-1");
      expect(dto.name).toBe("Updated Rate");
      expect(dto.vehicleType).toBe("MOTORCYCLE");
      expect(dto.pricePerUnit).toBe(2500);
      expect(dto.minChargeTimeMinutes).toBe("10");
    });
  });

  describe("mapFormToCreateRateModel", () => {
    it("should map RateFormData to CreateRateModel", () => {
      const form = {
        description: " Cobro por hora ",
        minChargeTimeMinutes: 15,
        name: " Tarifa Carro ",
        pricePerUnit: 5000,
        specialPolicyId: "policy-1",
        timeUnit: "HOURS" as const,
        vehicleType: "CAR" as const,
      };

      const model = mapFormToCreateRateModel(form, "parking-1");

      expect(model).toEqual({
        description: "Cobro por hora",
        minChargeTimeMinutes: 15,
        name: "Tarifa Carro",
        parkingId: "parking-1",
        pricePerUnit: 5000,
        specialPolicyId: "policy-1",
        timeUnit: "HOURS",
        vehicleType: "CAR",
      });
    });
  });

  describe("mapFormToUpdateRateModel", () => {
    it("should map RateFormData to UpdateRateModel", () => {
      const form = {
        description: " Cobro moto ",
        minChargeTimeMinutes: 10,
        name: " Tarifa Moto ",
        pricePerUnit: 2500,
        timeUnit: "HOURS" as const,
        vehicleType: "MOTORCYCLE" as const,
      };

      const model = mapFormToUpdateRateModel(form, "rate-123");

      expect(model).toEqual({
        description: "Cobro moto",
        id: "rate-123",
        minChargeTimeMinutes: 10,
        name: "Tarifa Moto",
        pricePerUnit: 2500,
        timeUnit: "HOURS",
        vehicleType: "MOTORCYCLE",
      });
    });
  });
});
