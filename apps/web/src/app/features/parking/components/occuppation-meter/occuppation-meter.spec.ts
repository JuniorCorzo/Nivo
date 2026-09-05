import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { OccuppationMeter } from "./occuppation-meter";

interface OccuppationMeterInternals {
  ratio: () => number;
  occupied: () => number;
}

@Component({
  imports: [OccuppationMeter],
  standalone: true,
  template: `
    <app-occuppation-meter
      [id]="id()"
      [min]="min()"
      [max]="max()"
      [value]="value()"
      [low]="low()"
      [optimum]="optimum()"
      [high]="high()"
      [totalCapacity]="totalCapacity()"
      [occupiedSlots]="occupiedSlots()"
      [showDetails]="showDetails()"
    />
  `,
})
class TestHostComponent {
  public id = signal("test-meter");
  public min = signal("0");
  public max = signal("100");
  public value = signal("0");
  public low = signal("33");
  public optimum = signal("70");
  public high = signal("90");
  public totalCapacity = signal<number | string | null>(100);
  public occupiedSlots = signal<number | string | null>(null);
  public showDetails = signal(false);
}

describe("OccuppationMeter", () => {
  let fixture: ComponentFixture<OccuppationMeter>;
  let component: OccuppationMeter;
  let internals: OccuppationMeterInternals;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccuppationMeter, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccuppationMeter);
    component = fixture.componentInstance;
    /* SAFETY: Accessing protected computeds for unit testing */
    internals = component as never;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  describe("ratio computed property", () => {
    it("should return default ratio 0 when value is 0", () => {
      expect(internals.ratio()).toBe(0);
    });

    it("should compute ratio correctly for standard values", () => {
      fixture.componentRef.setInput("value", "50");
      fixture.componentRef.setInput("max", "100");
      fixture.detectChanges();

      expect(internals.ratio()).toBe(50);
    });

    it("should compute ratio correctly with custom max and value", () => {
      fixture.componentRef.setInput("value", "25");
      fixture.componentRef.setInput("max", "50");
      fixture.detectChanges();

      expect(internals.ratio()).toBe(50);
    });

    it("should clamp ratio to 100 when value exceeds max", () => {
      fixture.componentRef.setInput("value", "150");
      fixture.componentRef.setInput("max", "100");
      fixture.detectChanges();

      expect(internals.ratio()).toBe(100);
    });

    it("should clamp ratio to 0 when value is negative", () => {
      fixture.componentRef.setInput("value", "-20");
      fixture.componentRef.setInput("max", "100");
      fixture.detectChanges();

      expect(internals.ratio()).toBe(0);
    });

    it("should return 0 when max is 0 or value produces NaN", () => {
      fixture.componentRef.setInput("value", "invalid");
      fixture.componentRef.setInput("max", "invalid");
      fixture.detectChanges();

      expect(internals.ratio()).toBe(0);
    });
  });

  describe("occupied computed property", () => {
    it("should use occupiedSlots when provided as a valid number", () => {
      fixture.componentRef.setInput("occupiedSlots", 42);
      fixture.componentRef.setInput("totalCapacity", 100);
      fixture.componentRef.setInput("value", "80");
      fixture.detectChanges();

      expect(internals.occupied()).toBe(42);
    });

    it("should use occupiedSlots when provided as a numeric string", () => {
      fixture.componentRef.setInput("occupiedSlots", "35");
      fixture.componentRef.setInput("totalCapacity", 100);
      fixture.componentRef.setInput("value", "80");
      fixture.detectChanges();

      expect(internals.occupied()).toBe(35);
    });

    it("should compute occupied from totalCapacity and value when occupiedSlots is not provided", () => {
      fixture.componentRef.setInput("occupiedSlots", undefined);
      fixture.componentRef.setInput("totalCapacity", 200);
      fixture.componentRef.setInput("value", "45");
      fixture.detectChanges();

      expect(internals.occupied()).toBe(90);
    });

    it("should return 0 when totalCapacity and value are undefined", () => {
      fixture.componentRef.setInput("occupiedSlots", undefined);
      fixture.componentRef.setInput("totalCapacity", undefined);
      fixture.componentRef.setInput("value", undefined);
      fixture.detectChanges();

      expect(internals.occupied()).toBe(0);
    });

    it("should compute occupied when occupiedSlots is empty string", () => {
      fixture.componentRef.setInput("occupiedSlots", "");
      fixture.componentRef.setInput("totalCapacity", 50);
      fixture.componentRef.setInput("value", "20");
      fixture.detectChanges();

      expect(internals.occupied()).toBe(10);
    });
  });

  describe("bar styling and thresholds", () => {
    it("should apply success background when ratio is below optimum", () => {
      fixture.componentRef.setInput("value", "50");
      fixture.componentRef.setInput("optimum", "70");
      fixture.componentRef.setInput("high", "90");
      fixture.detectChanges();

      /* SAFETY: Querying rendered meter element */
      const meterEl = fixture.nativeElement.querySelector(
        '[role="meter"]'
      ) as HTMLElement;
      expect(meterEl.style.getPropertyValue("--bar-background")).toBe(
        "var(--color-success)"
      );
      expect(meterEl.style.getPropertyValue("--bar-width")).toBe("50%");
    });

    it("should apply warning background when ratio is between optimum and high", () => {
      fixture.componentRef.setInput("value", "80");
      fixture.componentRef.setInput("optimum", "70");
      fixture.componentRef.setInput("high", "90");
      fixture.detectChanges();

      /* SAFETY: Querying rendered meter element */
      const meterEl = fixture.nativeElement.querySelector(
        '[role="meter"]'
      ) as HTMLElement;
      expect(meterEl.style.getPropertyValue("--bar-background")).toBe(
        "var(--color-warning)"
      );
      expect(meterEl.style.getPropertyValue("--bar-width")).toBe("80%");
    });

    it("should apply error background when ratio exceeds high threshold", () => {
      fixture.componentRef.setInput("value", "95");
      fixture.componentRef.setInput("optimum", "70");
      fixture.componentRef.setInput("high", "90");
      fixture.detectChanges();

      /* SAFETY: Querying rendered meter element */
      const meterEl = fixture.nativeElement.querySelector(
        '[role="meter"]'
      ) as HTMLElement;
      expect(meterEl.style.getPropertyValue("--bar-background")).toBe(
        "var(--color-error)"
      );
      expect(meterEl.style.getPropertyValue("--bar-width")).toBe("95%");
    });

    it("should apply success background when ratio equals optimum boundary", () => {
      fixture.componentRef.setInput("value", "70");
      fixture.componentRef.setInput("optimum", "70");
      fixture.componentRef.setInput("high", "90");
      fixture.detectChanges();

      /* SAFETY: Querying rendered meter element */
      const meterEl = fixture.nativeElement.querySelector(
        '[role="meter"]'
      ) as HTMLElement;
      expect(meterEl.style.getPropertyValue("--bar-background")).toBe(
        "var(--color-success)"
      );
    });
  });

  describe("template details and accessibility", () => {
    it("should not render details header by default", () => {
      const details = fixture.nativeElement.querySelector(".text-xs");
      expect(details).toBeNull();
    });

    it("should render details header when showDetails is true", () => {
      fixture.componentRef.setInput("showDetails", true);
      fixture.componentRef.setInput("totalCapacity", 120);
      fixture.componentRef.setInput("occupiedSlots", 60);
      fixture.componentRef.setInput("value", "50");
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent || "";
      expect(text).toContain("60");
      expect(text).toContain("120");
      expect(text).toContain("ocupados");
      expect(text).toContain("50%");
    });

    it("should set correct aria attributes on meter element", () => {
      fixture.componentRef.setInput("min", "10");
      fixture.componentRef.setInput("max", "200");
      fixture.componentRef.setInput("value", "75");
      fixture.detectChanges();

      /* SAFETY: Querying rendered meter element */
      const meterEl = fixture.nativeElement.querySelector(
        '[role="meter"]'
      ) as HTMLElement;
      expect(meterEl.getAttribute("aria-valuenow")).toBe("75");
      expect(meterEl.getAttribute("aria-valuemin")).toBe("10");
      expect(meterEl.getAttribute("aria-valuemax")).toBe("200");
    });
  });
});
