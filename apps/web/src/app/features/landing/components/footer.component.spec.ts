import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create footer component", () => {
    expect(component).toBeTruthy();
  });

  it("should render copyright, login, and static links by default without register CTA when disabled", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.copyright);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.login);
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.landing.ctaBanner.title
    );
    expect(compiled.textContent).not.toContain(
      APP_TEXTS.landing.footer.register
    );
  });

  it("should render cta banner and register link when accountCreationEnabled is true", () => {
    fixture.componentRef.setInput("accountCreationEnabled", true);
    fixture.detectChanges();

    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.ctaBanner.title);
    expect(compiled.textContent).toContain(APP_TEXTS.landing.footer.register);
  });

  it("should emit ctaClick when banner button is clicked while enabled", () => {
    fixture.componentRef.setInput("accountCreationEnabled", true);
    fixture.detectChanges();

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
