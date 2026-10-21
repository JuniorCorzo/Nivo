import type { ComponentRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import type { SimulateRateResponse } from "@core/models/simulator.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingSimulatorComponent } from "./landing-simulator.component";

describe("LandingSimulatorComponent", () => {
  let component: LandingSimulatorComponent;
  let componentRef: ComponentRef<LandingSimulatorComponent>;
  let fixture: ComponentFixture<LandingSimulatorComponent>;

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
    await TestBed.configureTestingModule({
      imports: [LandingSimulatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingSimulatorComponent);
    ({ componentInstance: component, componentRef } = fixture);

    componentRef.setInput("vehicleType", "CAR");
    componentRef.setInput("minutesStayed", 90);
    componentRef.setInput("pricePerUnit", 4000);
    componentRef.setInput("gracePeriodMinutes", 15);
    componentRef.setInput("ivaRate", 0.19);
    componentRef.setInput("simulationResult", mockCalculation);
    componentRef.setInput("isCalculating", false);

    fixture.detectChanges();
  });

  it("should create simulator component", () => {
    expect(component).toBeTruthy();
  });

  it("should render vehicle type options from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.simulator.vehicles.car
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.simulator.vehicles.motorcycle
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.simulator.vehicles.bike
    );
  });

  it("should emit vehicleTypeChange when vehicle button is clicked", () => {
    let selected: string | undefined;
    component.vehicleTypeChange.subscribe((val) => {
      selected = val;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const motoBtn = [...buttons].find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.simulator.vehicles.motorcycle)
    );
    motoBtn?.click();

    expect(selected).toBe("MOTORCYCLE");
  });

  it("should emit durationChange when preset button is clicked", () => {
    let minutes: number | undefined;
    component.durationChange.subscribe((val) => {
      minutes = val;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const presetBtn = [...buttons].find((b) =>
      b.textContent?.includes("3 horas")
    );
    presetBtn?.click();

    expect(minutes).toBe(180);
  });

  it("should emit durationChange on range input change", () => {
    let minutes: number | undefined;
    component.durationChange.subscribe((val) => {
      minutes = val;
    });

    /* SAFETY: Querying input element in DOM fixture */
    const rangeInput = fixture.nativeElement.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement;
    rangeInput.value = "120";
    rangeInput.dispatchEvent(new Event("input"));

    expect(minutes).toBe(120);
  });

  it("should render calculated totals when simulationResult is provided", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("9,520");
    expect(compiled.textContent).toContain("8,000");
    expect(compiled.textContent).toContain("1,520");
  });

  it("should emit registerClick when CTA button is clicked", () => {
    let emitted = false;
    component.registerClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const ctaBtn = [...buttons].find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.simulator.ctaButton)
    );
    ctaBtn?.click();

    expect(emitted).toBe(true);
  });
});
