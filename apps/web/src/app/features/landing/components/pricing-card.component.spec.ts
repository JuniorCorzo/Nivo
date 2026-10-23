import type { ComponentRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { PricingCardComponent } from "./pricing-card.component";
import type { PricingPlanItem } from "./pricing-card.component";

describe("PricingCardComponent", () => {
  let component: PricingCardComponent;
  let componentRef: ComponentRef<PricingCardComponent>;
  let fixture: ComponentFixture<PricingCardComponent>;

  const mockPlan: PricingPlanItem = {
    cta: "Probar Gratis",
    description: "Para parqueaderos individuales",
    features: ["Hasta 20 plazas", "Tickets WhatsApp"],
    isPopular: false,
    name: "Básico",
    period: "/ para siempre",
    price: "$0",
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingCardComponent);
    ({ componentInstance: component, componentRef } = fixture);

    componentRef.setInput("plan", mockPlan);
    fixture.detectChanges();
  });

  it("should create pricing card component", () => {
    expect(component).toBeTruthy();
  });

  it("should render plan name, price, and features", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Básico");
    expect(compiled.textContent).toContain("$0");
    expect(compiled.textContent).toContain("/ para siempre");
    expect(compiled.textContent).toContain("Hasta 20 plazas");
    expect(compiled.textContent).toContain("Tickets WhatsApp");
  });

  it("should render popular badge when plan isPopular is true", () => {
    componentRef.setInput("plan", { ...mockPlan, isPopular: true });
    componentRef.setInput("popularBadge", "Más Popular");
    fixture.detectChanges();

    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Más Popular");
  });

  it("should emit ctaClick when CTA button is clicked", () => {
    let clicked = false;
    component.ctaClick.subscribe(() => {
      clicked = true;
    });

    /* SAFETY: Querying nv-button in DOM */
    const button = fixture.nativeElement.querySelector(
      "nv-button"
    ) as HTMLElement;
    button?.click();

    expect(clicked).toBe(true);
  });
});
