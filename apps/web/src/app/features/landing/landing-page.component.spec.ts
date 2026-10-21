import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import type { SimulateRateResponse } from "@core/models/simulator.model";
import { SimulatorService } from "@core/services/simulator.service";
import { of, throwError } from "rxjs";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { LandingPageComponent } from "./landing-page.component";

describe("LandingPageComponent", () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let calculateMock: ReturnType<typeof vi.fn>;
  let router: Router;

  const mockCalculation: SimulateRateResponse = {
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
    calculateMock = vi.fn().mockReturnValue(of(mockCalculation));

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideRouter([]),
        { provide: SimulatorService, useValue: { calculate: calculateMock } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockImplementation(() =>
      Promise.resolve(true)
    );

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the landing page component", () => {
    expect(component).toBeTruthy();
  });

  it("should call simulatorService.calculate on initialization", () => {
    expect(calculateMock).toHaveBeenCalled();
    expect(component.simulationResult()).toEqual(mockCalculation);
  });

  it("should recalculate when vehicle type is changed to MOTORCYCLE", () => {
    calculateMock.mockClear();
    calculateMock.mockReturnValue(
      of({
        ...mockCalculation,
        total: 4760,
      })
    );

    component.selectVehicle("MOTORCYCLE");
    expect(component.vehicleType()).toBe("MOTORCYCLE");
    expect(calculateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleType: "MOTORCYCLE",
      })
    );
  });

  it("should recalculate when duration is changed", () => {
    calculateMock.mockClear();
    component.setDuration(180);
    expect(component.minutesStayed()).toBe(180);
    expect(calculateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        minutesStayed: 180,
      })
    );
  });

  it("should fallback gracefully if calculation api fails", () => {
    calculateMock.mockReturnValue(throwError(() => new Error("Network error")));
    component.setDuration(60);
    expect(component.simulationResult()).not.toBeNull();
    expect(component.simulationResult()?.subtotal).toBeGreaterThan(0);
  });

  it("should render hero headline 'De talonario de papel a control total en 2 minutos'", () => {
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      "De talonario de papel a control total en 2 minutos"
    );
  });

  it("should render paper vs digital comparison cards", () => {
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Talonario de Papel");
    expect(compiled.textContent).toContain("Control Digital con Nivo");
  });

  it("should render the 4 value pillars", () => {
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Cero inversión en hardware");
    expect(compiled.textContent).toContain("Liquidación exacta");
    expect(compiled.textContent).toContain("Arqueo sin fugas");
    expect(compiled.textContent).toContain("Tickets WhatsApp/QR");
  });

  it("should render pricing plans", () => {
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Planes");
    expect(compiled.textContent).toContain("Básico");
    expect(compiled.textContent).toContain("Pro");
  });

  it("should navigate to /auth/login when login CTA is triggered", () => {
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(["/auth/login"]);
  });

  it("should navigate to /auth/register when register CTA is triggered", () => {
    component.goToRegister();
    expect(router.navigate).toHaveBeenCalledWith(["/auth/register"]);
  });
});
