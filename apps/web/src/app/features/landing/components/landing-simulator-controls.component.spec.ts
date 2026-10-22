import type { ComponentRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingSimulatorControlsComponent } from "./landing-simulator-controls.component";

describe("LandingSimulatorControlsComponent", () => {
  let component: LandingSimulatorControlsComponent;
  let componentRef: ComponentRef<LandingSimulatorControlsComponent>;
  let fixture: ComponentFixture<LandingSimulatorControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSimulatorControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingSimulatorControlsComponent);
    ({ componentInstance: component, componentRef } = fixture);

    componentRef.setInput("vehicleType", "CAR");
    componentRef.setInput("minutesStayed", 90);
    componentRef.setInput("pricePerUnit", 4000);
    componentRef.setInput("gracePeriodMinutes", 15);
    componentRef.setInput("ivaRate", 0.19);

    fixture.detectChanges();
  });

  it("should create simulator controls component", () => {
    expect(component).toBeTruthy();
  });

  it("should emit vehicleTypeChange when vehicle button is clicked", () => {
    let selected: string | undefined;
    component.vehicleTypeChange.subscribe((val) => {
      selected = val;
    });

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll("nv-button")
    ) as HTMLElement[];
    const motoBtn = buttons.find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.simulator.vehicles.motorcycle)
    );
    motoBtn?.click();

    expect(selected).toBe("MOTORCYCLE");
  });

  it("should emit durationChange on range input change via valueAsNumber", () => {
    let minutes: number | undefined;
    component.durationChange.subscribe((val) => {
      minutes = val;
    });

    const rangeInput = fixture.nativeElement.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement;
    rangeInput.value = "180";
    rangeInput.dispatchEvent(new Event("input"));

    expect(minutes).toBe(180);
  });
});
