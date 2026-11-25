import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { OperationsKpiMetrics } from "@core/models/operations-cockpit.model";

import { OperationsKpiRibbonComponent } from "./kpi-ribbon";

const createMetrics = (
  overrides: Partial<OperationsKpiMetrics> = {}
): OperationsKpiMetrics => ({
  availableCarSlotsCount: 4,
  availableMotoSlotsCount: 3,
  availableSlotsCount: 7,
  occupationBarPercentage: 30,
  occupationPercentage: 30,
  occupiedSlotsCount: 3,
  totalCarSlotsCount: 6,
  totalMotoSlotsCount: 4,
  totalSlotsCount: 10,
  ...overrides,
});

describe("OperationsKpiRibbonComponent", () => {
  let fixture: ComponentFixture<OperationsKpiRibbonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsKpiRibbonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsKpiRibbonComponent);
  });

  it("should render global capacity, cars, motos, and active vehicle metrics", () => {
    fixture.componentRef.setInput("metrics", createMetrics());
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent?.replaceAll(
      /\s+/gu,
      " "
    );
    expect(text).toContain("Capacidad Global 30%");
    expect(text).toContain("7 libres de 10");
    expect(text).toContain("Carros 4 libres / 6");
    expect(text).toContain("Motos 3 libres / 4");
    expect(text).toContain("Activos 3 activos");
  });

  it("should handle zero-capacity parking lot without NaN or broken progress bars", () => {
    fixture.componentRef.setInput(
      "metrics",
      createMetrics({
        availableCarSlotsCount: 0,
        availableMotoSlotsCount: 0,
        availableSlotsCount: 0,
        occupationBarPercentage: 0,
        occupationPercentage: 0,
        occupiedSlotsCount: 0,
        totalCarSlotsCount: 0,
        totalMotoSlotsCount: 0,
        totalSlotsCount: 0,
      })
    );
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent?.replaceAll(/\s+/gu, " ") ?? "";
    expect(text).toContain("Capacidad Global 0%");
    expect(text).toContain("0 libres de 0");
    expect(text).toContain("Activos 0 activos");
    expect(text).not.toContain("Carros");
    expect(text).not.toContain("Motos");
    expect(text).not.toContain("NaN");

    const progressBars = [
      ...el.querySelectorAll<HTMLElement>(".bg-muted > div"),
    ];
    expect(progressBars.length).toBe(2);
    for (const bar of progressBars) {
      expect(bar.style.width).toBe("0%");
    }
  });

  it("should apply warning and destructive styling when occupancy crosses 75% and 90% thresholds", () => {
    fixture.componentRef.setInput(
      "metrics",
      createMetrics({
        occupationBarPercentage: 80,
        occupationPercentage: 80,
      })
    );
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector(".bg-warning")).not.toBeNull();
    expect(el.querySelector(".bg-destructive")).toBeNull();

    fixture.componentRef.setInput(
      "metrics",
      createMetrics({
        occupationBarPercentage: 95,
        occupationPercentage: 95,
      })
    );
    fixture.detectChanges();
    expect(el.querySelector(".bg-destructive")).not.toBeNull();
  });
});
