import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyH6,
} from "./typography";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TypographyH1,
    TypographyH2,
    TypographyH3,
    TypographyH4,
    TypographyH5,
    TypographyH6,
  ],
  standalone: true,
  template: `
    <nv-h1>Heading 1 Content</nv-h1>
    <nv-h2>Heading 2 Content</nv-h2>
    <nv-h3>Heading 3 Content</nv-h3>
    <nv-h4>Heading 4 Content</nv-h4>
    <nv-h5>Heading 5 Content</nv-h5>
    <nv-h6>Heading 6 Content</nv-h6>
  `,
})
class TestHostComponent {}

describe("Typography Headings", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  it("should render TypographyH1 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h1");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 1 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-3xl font-bold tracking-tight text-foreground font-sans"
    );
  });

  it("should render TypographyH2 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h2");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 2 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-2xl font-semibold tracking-tight text-foreground font-sans"
    );
  });

  it("should render TypographyH3 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h3");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 3 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-xl font-semibold tracking-tight text-foreground font-sans"
    );
  });

  it("should render TypographyH4 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h4");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 4 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-lg font-semibold tracking-tight text-foreground font-sans"
    );
  });

  it("should render TypographyH5 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h5");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 5 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-base font-semibold tracking-tight text-foreground font-sans"
    );
  });

  it("should render TypographyH6 with proper classes and project content", () => {
    const heading = element.querySelector("nv-h6");
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe("Heading 6 Content");
    expect(heading?.className).toBe(
      "block scroll-m-20 text-sm font-semibold tracking-tight text-foreground font-sans"
    );
  });
});
