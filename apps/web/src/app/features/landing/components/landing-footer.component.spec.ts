import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingFooterComponent } from "./landing-footer.component";

describe("LandingFooterComponent", () => {
  let component: LandingFooterComponent;
  let fixture: ComponentFixture<LandingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create footer component", () => {
    expect(component).toBeTruthy();
  });

  it("should render cta banner and footer links from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.ctaBanner.title);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.copyright);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.login);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.register);
  });

  it("should emit ctaClick when banner button is clicked", () => {
    let emitted = false;
    component.ctaClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Querying CTA button element in DOM fixture */
    const ctaBtn = fixture.nativeElement.querySelector(
      "section nv-button"
    ) as HTMLElement;
    ctaBtn?.click();

    expect(emitted).toBe(true);
  });
});
