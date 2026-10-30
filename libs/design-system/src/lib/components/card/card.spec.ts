import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from "./index";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
  ],
  standalone: true,
  template: `
    <nv-card id="test-card">
      <nv-card-header id="test-header">
        <nv-card-title id="test-title">Card Title</nv-card-title>
        <nv-card-description id="test-desc"
          >Card Description</nv-card-description
        >
      </nv-card-header>
      <nv-card-content id="test-content">
        <p>Main card content goes here.</p>
      </nv-card-content>
      <nv-card-footer id="test-footer">
        <button type="button">Action</button>
      </nv-card-footer>
    </nv-card>
  `,
})
class TestHostComponent {}

describe("CardComponent and Subcomponents", () => {
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

  it("should render nv-card container with border, card background, card-foreground, and font-sans", () => {
    const card = element.querySelector<HTMLElement>("#test-card");
    expect(card).not.toBeNull();
    expect(card?.className).toContain("border-[var(--border)]");
    expect(card?.className).toContain("bg-[var(--card)]");
    expect(card?.className).toContain("text-[var(--card-foreground)]");
    expect(card?.className).toContain("rounded-lg");
    expect(card?.className).toContain("font-sans");
  });

  it("should render nv-card-header with padding and flex column layout", () => {
    const header = element.querySelector<HTMLElement>("#test-header");
    expect(header).not.toBeNull();
    expect(header?.className).toContain("flex");
    expect(header?.className).toContain("flex-col");
    expect(header?.className).toContain("p-6");
  });

  it("should render nv-card-title with font-semibold and font-sans", () => {
    const title = element.querySelector<HTMLElement>("#test-title");
    expect(title).not.toBeNull();
    expect(title?.textContent?.trim()).toBe("Card Title");
    expect(title?.className).toContain("font-semibold");
    expect(title?.className).toContain("font-sans");
  });

  it("should render nv-card-description with muted-foreground and font-sans", () => {
    const desc = element.querySelector<HTMLElement>("#test-desc");
    expect(desc).not.toBeNull();
    expect(desc?.textContent?.trim()).toBe("Card Description");
    expect(desc?.className).toContain("text-[var(--muted-foreground)]");
    expect(desc?.className).toContain("font-sans");
  });

  it("should render nv-card-content with padding and projected content", () => {
    const content = element.querySelector<HTMLElement>("#test-content");
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain("Main card content goes here.");
    expect(content?.className).toContain("p-5");
  });

  it("should render nv-card-footer with flex layout and projected action", () => {
    const footer = element.querySelector<HTMLElement>("#test-footer");
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain("flex");
    expect(footer?.className).toContain("items-center");
    expect(footer?.querySelector("button")?.textContent?.trim()).toBe("Action");
  });
});
