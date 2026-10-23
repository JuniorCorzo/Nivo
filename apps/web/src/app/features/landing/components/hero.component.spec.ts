import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { HeroComponent } from "./hero.component";

describe("HeroComponent", () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create hero component", () => {
    expect(component).toBeTruthy();
  });

  it("should render hero titles and stats from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.hero.title);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.hero.badge);
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.hero.stats.hardware.value
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.hero.stats.time.value
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.hero.stats.accuracy.value
    );
  });

  it("should emit trySimulatorClick when CTA is clicked", () => {
    let emitted = false;
    component.trySimulatorClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = [
      ...fixture.nativeElement.querySelectorAll("nv-button"),
    ] as HTMLElement[];
    const ctaBtn = buttons.find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.hero.trySimulator)
    );
    ctaBtn?.click();

    expect(emitted).toBe(true);
  });

  it("should emit registerClick when free account button is clicked", () => {
    let emitted = false;
    component.registerClick.subscribe(() => {
      emitted = true;
    });

    /* SAFETY: Querying nv-button elements in DOM fixture */
    const buttons = [
      ...fixture.nativeElement.querySelectorAll("nv-button"),
    ] as HTMLElement[];
    const registerBtn = buttons.find((b) =>
      b.textContent?.includes(APP_TEXTS.landing.hero.createAccountFree)
    );
    registerBtn?.click();

    expect(emitted).toBe(true);
  });
});
