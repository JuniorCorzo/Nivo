import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { NavbarComponent } from "./navbar.component";

describe("NavbarComponent", () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
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

  it("should not render register button when accountCreationEnabled is false", () => {
    /* SAFETY: Finding button by text content */
    const buttons = fixture.nativeElement.querySelectorAll(
      "nv-button"
    ) as NodeListOf<HTMLElement>;
    const registerBtn = [...buttons].find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.navbar.register)
    );
    expect(registerBtn).toBeUndefined();
  });

  it("should emit registerClick when register button is clicked and enabled", () => {
    fixture.componentRef.setInput("accountCreationEnabled", true);
    fixture.detectChanges();

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

  it("should toggle mobile menu open state when toggle button is clicked", () => {
    expect(component.isMobileMenuOpen()).toBe(false);

    /* SAFETY: Querying toggle button by aria-label */
    const toggleBtn = fixture.nativeElement.querySelector(
      'nv-button[aria-label="Toggle navigation menu"]'
    ) as HTMLElement;
    toggleBtn?.click();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(true);
    expect(toggleBtn?.getAttribute("aria-expanded")).toBe("true");

    toggleBtn?.click();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(false);
    expect(toggleBtn?.getAttribute("aria-expanded")).toBe("false");
  });

  it("should close mobile menu when a mobile nav link is clicked", () => {
    component.toggleMobileMenu();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(true);

    /* SAFETY: Querying mobile nav link */
    const mobileLink = fixture.nativeElement.querySelector(
      'div.border-t nav a[href="#beneficios"]'
    ) as HTMLElement;
    expect(mobileLink).not.toBeNull();

    mobileLink?.click();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(false);
  });
});
