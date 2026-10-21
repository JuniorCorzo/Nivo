import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardHeaderComponent } from "./dashboard-header";

describe("DashboardHeaderComponent", () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
  });

  it("debe renderizar título y subtítulo sin indicador SSE", () => {
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.title);
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.subtitle);
    expect(compiled.querySelector("[badge]")).toBeNull();
  });

  it("debe emitir granularityChange al hacer clic en filtros de granularidad", () => {
    const emitSpy = vi.fn();
    component.granularityChange.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Test query returns an HTMLElement */
    const btnWeek = compiled.querySelector(
      '[data-testid="granularity-week"]'
    ) as HTMLElement;
    btnWeek.click();

    expect(emitSpy).toHaveBeenCalledWith("7days");
  });

  it("debe emitir refreshTelemetry al hacer clic en sincronizar", () => {
    const emitSpy = vi.fn();
    component.refreshTelemetry.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const syncBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(APP_TEXTS.dashboard.actions.sync)
    );
    syncBtn?.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it("no debe renderizar selector multi-sede cuando isMultiParkingTenant es false", () => {
    fixture.componentRef.setInput("isMultiParkingTenant", false);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeNull();
  });

  it("debe renderizar selector multi-sede y emitir scopeChange al seleccionar sede", () => {
    fixture.componentRef.setInput("isMultiParkingTenant", true);
    fixture.componentRef.setInput("accessibleParkings", [
      { id: "p1", name: "Sede Centro" },
      { id: "p2", name: "Sede Norte" },
    ]);
    fixture.componentRef.setInput("activeScope", { mode: "GLOBAL" });
    const emitSpy = vi.fn();
    component.scopeChange.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('[data-testid="multi-parking-selector"]')
    ).toBeTruthy();

    const buttons = compiled.querySelectorAll(
      '[data-testid="multi-parking-selector"] button'
    );
    /* SAFETY: Matched button is guaranteed to be an HTMLElement */
    const p1Btn = [...buttons].find((b) =>
      b.textContent?.includes("Sede Centro")
    ) as HTMLElement;
    p1Btn.click();

    expect(emitSpy).toHaveBeenCalledWith({ mode: "SINGLE", parkingId: "p1" });
  });
});
