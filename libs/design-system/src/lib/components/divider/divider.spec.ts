import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { DividerComponent } from "./divider";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DividerComponent],
  standalone: true,
  template: `
    <nv-divider id="default-divider" />
    <nv-divider id="vertical-divider" orientation="vertical" />
    <nv-divider id="thin-horizontal" thickness="thin" />
    <nv-divider id="thick-horizontal" thickness="thick" />
    <nv-divider id="thin-vertical" orientation="vertical" thickness="thin" />
    <nv-divider id="thick-vertical" orientation="vertical" thickness="thick" />
    <nv-divider id="strong-variant" variant="strong" />
    <nv-divider id="subtle-variant" variant="subtle" />
    <nv-divider
      id="custom-class"
      orientation="vertical"
      class="mx-2 hidden h-7 sm:block"
    />
    <nv-divisor
      id="divisor-alias"
      orientation="horizontal"
      [decorative]="false"
    />
  `,
})
class TestHostComponent {}

describe("DividerComponent", () => {
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

  it("should render horizontal divider with default classes and presentation role", () => {
    const divider = element.querySelector("#default-divider");
    expect(divider).not.toBeNull();
    expect(divider?.getAttribute("role")).toBe("none");
    expect(divider?.classList.contains("shrink-0")).toBe(true);
    expect(divider?.classList.contains("block")).toBe(true);
    expect(divider?.classList.contains("h-[2px]")).toBe(true);
    expect(divider?.classList.contains("w-full")).toBe(true);
    expect(divider?.classList.contains("rounded-full")).toBe(true);
    expect(divider?.classList.contains("bg-neutral-300")).toBe(true);
    expect(divider?.classList.contains("dark:bg-neutral-700")).toBe(true);
  });

  it("should render vertical divider with vertical orientation attributes and default dimensions", () => {
    const divider = element.querySelector("#vertical-divider");
    expect(divider).not.toBeNull();
    expect(divider?.getAttribute("aria-orientation")).toBe("vertical");
    expect(divider?.classList.contains("w-[2px]")).toBe(true);
    expect(divider?.classList.contains("h-6")).toBe(true);
    expect(divider?.classList.contains("rounded-full")).toBe(true);
    expect(divider?.classList.contains("bg-neutral-300")).toBe(true);
    expect(divider?.classList.contains("dark:bg-neutral-700")).toBe(true);
  });

  it("should apply thin thickness correctly for horizontal and vertical", () => {
    const horizontal = element.querySelector("#thin-horizontal");
    expect(horizontal?.classList.contains("h-[1px]")).toBe(true);
    expect(horizontal?.classList.contains("w-full")).toBe(true);

    const vertical = element.querySelector("#thin-vertical");
    expect(vertical?.classList.contains("w-[1px]")).toBe(true);
    expect(vertical?.classList.contains("h-6")).toBe(true);
  });

  it("should apply thick thickness correctly for horizontal and vertical", () => {
    const horizontal = element.querySelector("#thick-horizontal");
    expect(horizontal?.classList.contains("h-[3px]")).toBe(true);
    expect(horizontal?.classList.contains("w-full")).toBe(true);

    const vertical = element.querySelector("#thick-vertical");
    expect(vertical?.classList.contains("w-[3px]")).toBe(true);
    expect(vertical?.classList.contains("h-6")).toBe(true);
  });

  it("should apply strong and subtle color variants", () => {
    const strong = element.querySelector("#strong-variant");
    expect(strong?.classList.contains("bg-neutral-400")).toBe(true);
    expect(strong?.classList.contains("dark:bg-neutral-600")).toBe(true);

    const subtle = element.querySelector("#subtle-variant");
    expect(subtle?.classList.contains("bg-[var(--border)]")).toBe(true);
  });

  it("should preserve custom classes", () => {
    const custom = element.querySelector("#custom-class");
    expect(custom?.classList.contains("mx-2")).toBe(true);
    expect(custom?.classList.contains("hidden")).toBe(true);
    expect(custom?.classList.contains("h-7")).toBe(true);
    expect(custom?.classList.contains("sm:block")).toBe(true);
  });

  it("should support nv-divisor alias and non-decorative separator role", () => {
    const divisor = element.querySelector("#divisor-alias");
    expect(divisor).not.toBeNull();
    expect(divisor?.getAttribute("role")).toBe("separator");
    expect(divisor?.classList.contains("h-[2px]")).toBe(true);
  });
});
