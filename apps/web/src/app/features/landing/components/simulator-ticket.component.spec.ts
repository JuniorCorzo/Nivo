import type { ComponentRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import type { SimulateRateResponse } from "@core/api/generated/models";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { SimulatorTicketComponent } from "./simulator-ticket.component";

describe("SimulatorTicketComponent", () => {
  let component: SimulatorTicketComponent;
  let componentRef: ComponentRef<SimulatorTicketComponent>;
  let fixture: ComponentFixture<SimulatorTicketComponent>;

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
      imports: [SimulatorTicketComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorTicketComponent);
    ({ componentInstance: component, componentRef } = fixture);

    componentRef.setInput("vehicleType", "CAR");
    componentRef.setInput("minutesStayed", 90);
    componentRef.setInput("simulationResult", mockCalculation);

    fixture.detectChanges();
  });

  it("should create ticket preview component", () => {
    expect(component).toBeTruthy();
  });

  it("should render simulated ticket information and breakdown", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.simulator.ticketTitle
    );
    expect(compiled.textContent).toContain("9,520");
    expect(compiled.textContent).toContain("8,000");
    expect(compiled.textContent).toContain("1,520");
    expect(compiled.textContent).toContain("Tarifa CAR");
  });

  it("should emit registerClick when CTA button is clicked", () => {
    let clicked = false;
    component.registerClick.subscribe(() => {
      clicked = true;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = [
      ...fixture.nativeElement.querySelectorAll("nv-button"),
    ] as HTMLElement[];
    const ctaBtn = buttons.find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.simulator.ctaButton)
    );
    ctaBtn?.click();

    expect(clicked).toBe(true);
  });
});
