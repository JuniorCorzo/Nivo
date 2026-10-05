import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { LoaderComponent } from "./loader";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent],
  standalone: true,
  template: `
    <nv-loader id="default-loader" />
    <nv-loader id="sm-loader" size="sm" />
    <nv-loader id="lg-loader" size="lg" />
    <nv-loader id="primary-loader" variant="primary" />
    <nv-loader id="muted-loader" variant="muted" />
    <nv-loader id="white-loader" variant="white" />
    <nv-loader id="custom-label-loader" label="Procesando pago..." />
    <nv-spinner id="spinner-alias" size="sm" variant="primary" />
  `,
})
class TestHostComponent {}

describe("LoaderComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    /* SAFETY: Test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  it("should render default loader with status role, aria-live polite and sr-only default text", () => {
    const loader = element.querySelector("#default-loader");
    expect(loader).not.toBeNull();
    expect(loader?.getAttribute("role")).toBe("status");
    expect(loader?.getAttribute("aria-live")).toBe("polite");

    const srOnly = loader?.querySelector(".sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent?.trim()).toBe("Cargando...");

    const svg = loader?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.classList.contains("animate-spin")).toBe(true);
    expect(svg?.classList.contains("h-6")).toBe(true);
    expect(svg?.classList.contains("w-6")).toBe(true);
  });

  it("should apply size variants (sm, md, lg)", () => {
    const smLoader = element.querySelector("#sm-loader svg");
    expect(smLoader?.classList.contains("h-4")).toBe(true);
    expect(smLoader?.classList.contains("w-4")).toBe(true);

    const lgLoader = element.querySelector("#lg-loader svg");
    expect(lgLoader?.classList.contains("h-9")).toBe(true);
    expect(lgLoader?.classList.contains("w-9")).toBe(true);
  });

  it("should apply color variants (default, primary, muted, white)", () => {
    const defaultLoader = element.querySelector("#default-loader svg");
    expect(defaultLoader?.classList.contains("text-current")).toBe(true);

    const primaryLoader = element.querySelector("#primary-loader svg");
    expect(primaryLoader?.classList.contains("text-[var(--primary)]")).toBe(
      true
    );

    const mutedLoader = element.querySelector("#muted-loader svg");
    expect(mutedLoader?.classList.contains("text-neutral-400")).toBe(true);

    const whiteLoader = element.querySelector("#white-loader svg");
    expect(whiteLoader?.classList.contains("text-white")).toBe(true);
  });

  it("should support custom accessible label", () => {
    const loader = element.querySelector("#custom-label-loader");
    const srOnly = loader?.querySelector(".sr-only");
    expect(srOnly?.textContent?.trim()).toBe("Procesando pago...");
  });

  it("should support nv-spinner selector alias", () => {
    const spinner = element.querySelector("#spinner-alias");
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute("role")).toBe("status");
    expect(spinner?.getAttribute("aria-live")).toBe("polite");

    const svg = spinner?.querySelector("svg");
    expect(svg?.classList.contains("h-4")).toBe(true);
    expect(svg?.classList.contains("text-[var(--primary)]")).toBe(true);
  });
});
