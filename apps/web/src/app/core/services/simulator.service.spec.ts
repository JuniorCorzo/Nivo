import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import type {
  SimulateRateRequest,
  SimulateRateResponse,
} from "@core/models/simulator.model";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { SimulatorService } from "./simulator.service";

describe("SimulatorService", () => {
  let service: SimulatorService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SimulatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SimulatorService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should post calculate request to /api/public/simulator/calculate", () => {
    const request: SimulateRateRequest = {
      gracePeriodMinutes: 15,
      ivaRate: 0.19,
      minutesStayed: 90,
      pricePerUnit: 4000,
      timeUnit: "HOURS",
      vehicleType: "CAR",
    };

    const mockResponse: SimulateRateResponse = {
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

    service.calculate(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.total).toBe(9520);
      expect(res.breakpoints.length).toBe(1);
    });

    const req = httpTesting.expectOne("/api/public/simulator/calculate");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(request);

    req.flush(mockResponse);
  });
});
