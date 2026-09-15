import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { ButtonComponent } from "./button";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  standalone: true,
  template: `
    <nv-button id="default-btn">Click me</nv-button>
    <nv-button id="disabled-btn" [disabled]="true">Disabled</nv-button>
    <nv-button id="loading-btn" [loading]="isLoading()">Submit</nv-button>
    <nv-button id="loading-sm-btn" [loading]="true" size="sm">Small</nv-button>
    <nv-button id="loading-lg-btn" [loading]="true" size="lg">Large</nv-button>
    <nv-button
      id="loading-destructive-btn"
      [loading]="true"
      variant="destructive"
      >Delete</nv-button
    >
  `,
})
class TestHostComponent {
  readonly isLoading = signal(true);
}

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: Test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  it("should render default button correctly", () => {
    const btn = element.querySelector<HTMLButtonElement>("#default-btn button");
    expect(btn).not.toBeNull();
    expect(btn?.type).toBe("button");
    expect(btn?.disabled).toBe(false);
    expect(btn?.textContent?.trim()).toBe("Click me");
    expect(btn?.classList.contains("h-9")).toBe(true);
    expect(btn?.querySelector("nv-loader")).toBeNull();
  });

  it("should disable button when disabled input is true", () => {
    const btn = element.querySelector<HTMLButtonElement>(
      "#disabled-btn button"
    );
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(true);
    expect(btn?.querySelector("nv-loader")).toBeNull();
  });

  it("should disable button and show nv-loader when loading is true", () => {
    const btn = element.querySelector<HTMLButtonElement>("#loading-btn button");
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute("aria-busy")).toBe("true");

    const loader = btn?.querySelector("nv-loader");
    expect(loader).not.toBeNull();
    expect(
      loader?.querySelector("svg")?.classList.contains("animate-spin")
    ).toBe(true);
    expect(btn?.textContent?.includes("Submit")).toBe(true);
  });

  it("should remove nv-loader and enable button when loading becomes false", () => {
    hostComponent.isLoading.set(false);
    fixture.detectChanges();

    const btn = element.querySelector<HTMLButtonElement>("#loading-btn button");
    expect(btn?.disabled).toBe(false);
    expect(btn?.getAttribute("aria-busy")).toBeNull();
    expect(btn?.querySelector("nv-loader")).toBeNull();
  });

  it("should render matching loader size based on button size", () => {
    const smBtn = element.querySelector<HTMLButtonElement>(
      "#loading-sm-btn button"
    );
    const smLoaderSvg = smBtn?.querySelector("nv-loader svg");
    expect(smLoaderSvg?.classList.contains("h-4")).toBe(true);
    expect(smLoaderSvg?.classList.contains("w-4")).toBe(true);

    const lgBtn = element.querySelector<HTMLButtonElement>(
      "#loading-lg-btn button"
    );
    const lgLoaderSvg = lgBtn?.querySelector("nv-loader svg");
    expect(lgLoaderSvg?.classList.contains("h-6")).toBe(true);
    expect(lgLoaderSvg?.classList.contains("w-6")).toBe(true);
  });

  it("should render white loader for destructive variant", () => {
    const destructiveBtn = element.querySelector<HTMLButtonElement>(
      "#loading-destructive-btn button"
    );
    const loaderSvg = destructiveBtn?.querySelector("nv-loader svg");
    expect(loaderSvg?.classList.contains("text-white")).toBe(true);
  });
});
