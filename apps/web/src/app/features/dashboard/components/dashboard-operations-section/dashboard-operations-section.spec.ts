import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardOperationsSectionComponent } from "./dashboard-operations-section";

describe("DashboardOperationsSectionComponent", () => {
  let component: DashboardOperationsSectionComponent;
  let fixture: ComponentFixture<DashboardOperationsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOperationsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOperationsSectionComponent);
    component = fixture.componentInstance;
  });

  it("con single parking solo debe renderizar flujo operativo en ancho completo", () => {
    fixture.componentRef.setInput("isMultiParkingTenant", false);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeNull();
    expect(compiled.querySelector("app-recent-activity-stream")).toBeTruthy();
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.operations.recentActivity.title
    );
  });

  it("con multi parking debe renderizar gráfico comparativo y emitir parkingSelected", () => {
    fixture.componentRef.setInput("isMultiParkingTenant", true);
    fixture.componentRef.setInput("parkingsComparison", [
      {
        activeTickets: 5,
        avgStayMinutes: 40,
        occupancyRate: 80,
        occupiedSlots: 80,
        parkingId: "p1",
        parkingName: "Sede Centro",
        todayRevenue: 200_000,
        totalSlots: 100,
      },
    ]);
    const emitSpy = vi.fn();
    component.parkingSelected.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("app-parking-comparison-chart")).toBeTruthy();
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.operations.comparison.title
    );
    expect(compiled.textContent).toContain("1 instalaciones");

    component.parkingSelected.emit("p1");
    expect(emitSpy).toHaveBeenCalledWith("p1");
  });
});
