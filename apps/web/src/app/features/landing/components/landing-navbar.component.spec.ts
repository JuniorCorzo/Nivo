import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingNavbarComponent } from "./landing-navbar.component";

describe("LandingNavbarComponent", () => {
  let component: LandingNavbarComponent;
  let fixture: ComponentFixture<LandingNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingNavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create navbar component", () => {
    expect(component).toBeTruthy();
  });

  it("should render navigation links bound to APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.navbar.benefits);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.navbar.simulator);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.navbar.pricing);
  });

  it("should emit loginClick when login button is clicked", () => {
    let emitted = false;
    component.loginClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Finding button by text content */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const loginBtn = [...buttons].find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.navbar.login)
    );
    loginBtn?.click();

    expect(emitted).toBe(true);
  });

  it("should emit registerClick when register button is clicked", () => {
    let emitted = false;
    component.registerClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Finding button by text content */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const registerBtn = [...buttons].find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.navbar.register)
    );
    registerBtn?.click();

    expect(emitted).toBe(true);
  });
});
