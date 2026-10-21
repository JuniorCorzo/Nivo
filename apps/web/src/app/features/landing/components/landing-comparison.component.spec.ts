import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { beforeEach, describe, expect, it } from "vitest";

import { LandingComparisonComponent } from "./landing-comparison.component";

describe("LandingComparisonComponent", () => {
  let component: LandingComparisonComponent;
  let fixture: ComponentFixture<LandingComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComparisonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create comparison component", () => {
    expect(component).toBeTruthy();
  });

  it("should render comparison titles and points from APP_TEXTS", () => {
    /* SAFETY: Fixture native element is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.landing.comparison.title);
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.comparison.paper.title
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.landing.comparison.digital.title
    );

    for (const point of APP_TEXTS.landing.comparison.paper.points) {
      expect(compiled.textContent).toContain(point);
    }
    for (const point of APP_TEXTS.landing.comparison.digital.points) {
      expect(compiled.textContent).toContain(point);
    }
  });
});
