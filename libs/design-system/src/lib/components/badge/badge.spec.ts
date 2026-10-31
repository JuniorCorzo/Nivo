import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { BadgeComponent } from "./badge";
import type { BadgeVariant } from "./badge";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  standalone: true,
  template: `
    <nv-badge id="default-badge">Default</nv-badge>
    <nv-badge id="secondary-badge" variant="secondary">Secondary</nv-badge>
    <nv-badge id="destructive-badge" variant="destructive">Destructive</nv-badge>
    <nv-badge id="outline-badge" variant="outline">Outline</nv-badge>
    <nv-badge id="success-badge" variant="success">Success</nv-badge>
    <nv-badge id="warning-badge" variant="warning">Warning</nv-badge>
    <nv-badge id="info-badge" variant="info">Info</nv-badge>
    <nv-badge id="dynamic-badge" [variant]="dynamicVariant()">Dynamic</nv-badge>
  `,
})
class TestHostComponent {
  readonly dynamicVariant = signal<BadgeVariant>("default");
}

describe("BadgeComponent", () => {
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
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  it("should render default badge with primary tokens and font-sans", () => {
    const badge = element.querySelector<HTMLElement>("#default-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Default");
    expect(badge?.className).toContain("font-sans");
    expect(badge?.className).toContain("bg-[var(--primary)]");
    expect(badge?.className).toContain("text-[var(--primary-foreground)]");
  });

  it("should render secondary badge with secondary tokens", () => {
    const badge = element.querySelector<HTMLElement>("#secondary-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Secondary");
    expect(badge?.className).toContain("bg-[var(--secondary)]");
    expect(badge?.className).toContain("text-[var(--secondary-foreground)]");
  });

  it("should render destructive badge with destructive tokens", () => {
    const badge = element.querySelector<HTMLElement>("#destructive-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Destructive");
    expect(badge?.className).toContain("bg-[var(--destructive)]");
    expect(badge?.className).toContain("text-[var(--destructive-foreground)]");
  });

  it("should render outline badge with border and foreground tokens", () => {
    const badge = element.querySelector<HTMLElement>("#outline-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Outline");
    expect(badge?.className).toContain("border-[var(--border)]");
    expect(badge?.className).toContain("text-[var(--foreground)]");
  });

  it("should render semantic success badge with /15 opacity background and accessible text token", () => {
    const badge = element.querySelector<HTMLElement>("#success-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Success");
    expect(badge?.className).toContain("bg-[var(--semantic-success)]/15");
    expect(badge?.className).toContain("text-[var(--semantic-success)]");
  });

  it("should render semantic warning badge with /15 opacity background and accessible text token", () => {
    const badge = element.querySelector<HTMLElement>("#warning-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Warning");
    expect(badge?.className).toContain("bg-[var(--semantic-warning)]/15");
    expect(badge?.className).toContain("text-[var(--semantic-warning)]");
  });

  it("should render semantic info badge with /15 opacity background and accessible text token", () => {
    const badge = element.querySelector<HTMLElement>("#info-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent?.trim()).toBe("Info");
    expect(badge?.className).toContain("bg-[var(--semantic-info)]/15");
    expect(badge?.className).toContain("text-[var(--semantic-info)]");
  });

  it("should reactively update classes when variant changes", () => {
    const badge = element.querySelector<HTMLElement>("#dynamic-badge");
    expect(badge?.className).toContain("bg-[var(--primary)]");

    hostComponent.dynamicVariant.set("success");
    fixture.detectChanges();
    expect(badge?.className).toContain("bg-[var(--semantic-success)]/15");
    expect(badge?.className).not.toContain("bg-[var(--primary)]");

    hostComponent.dynamicVariant.set("outline");
    fixture.detectChanges();
    expect(badge?.className).toContain("border-[var(--border)]");
  });
});
