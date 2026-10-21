import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingBenefitsComponent } from "./landing-benefits.component";

describe("LandingBenefitsComponent", () => {
  let component: LandingBenefitsComponent;
  let fixture: ComponentFixture<LandingBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingBenefitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create benefits component", () => {
    expect(component).toBeTruthy();
  });

  it("should render all value pillars from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.benefits.title);
    for (const item of APP_TEXTS.landing.benefits.items) {
      expect(compiled.textContent).toContain(item.title);
    }
  });
});
