import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingPricingComponent } from "./landing-pricing.component";

describe("LandingPricingComponent", () => {
  let component: LandingPricingComponent;
  let fixture: ComponentFixture<LandingPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPricingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create pricing component", () => {
    expect(component).toBeTruthy();
  });

  it("should render pricing plans from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.pricing.title);
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.pricing.basic.name
    );
    expect(compiled.textContent).toContain(APP_TEXTS.landing.pricing.pro.name);
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.pricing.multiSite.name
    );
  });

  it("should emit registerClick when any pricing CTA is clicked", () => {
    let callCount = 0;
    component.registerClick.subscribe(() => {
      callCount += 1;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll("nv-button")
    ) as HTMLElement[];
    buttons[0]?.click();
    buttons[1]?.click();

    expect(callCount).toBe(2);
  });
});
