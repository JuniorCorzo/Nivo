import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DashboardReportsSectionComponent } from "./dashboard-reports-section";

describe("DashboardReportsSectionComponent", () => {
  let component: DashboardReportsSectionComponent;
  let fixture: ComponentFixture<DashboardReportsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardReportsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardReportsSectionComponent);
    component = fixture.componentInstance;
  });

  it("debe renderizar título, descripción y botón de exportar CSV", () => {
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(APP_TEXTS.dashboard.reports.title);
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.reports.description
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.dashboard.actions.exportCsv
    );
  });

  it("debe emitir exportCsv al hacer clic en el botón de descarga", () => {
    const emitSpy = vi.fn();
    component.exportCsv.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    const exportBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(APP_TEXTS.dashboard.actions.exportCsv)
    );
    exportBtn?.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it("no debe mostrar controles de paginación si totalPages <= 1", () => {
    fixture.componentRef.setInput("totalPages", 1);
    fixture.componentRef.setInput("page", 0);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.textContent?.includes(
        APP_TEXTS.dashboard.reports.pagination.previous
      )
    ).toBe(false);
  });

  it("debe mostrar paginación y emitir pageChange al navegar páginas", () => {
    fixture.componentRef.setInput("totalPages", 3);
    fixture.componentRef.setInput("page", 1);
    const emitSpy = vi.fn();
    component.pageChange.subscribe(emitSpy);
    fixture.detectChanges();

    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Página 2 de 3");

    const prevBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(APP_TEXTS.dashboard.reports.pagination.previous)
    );
    const nextBtn = [...compiled.querySelectorAll("button")].find((b) =>
      b.textContent?.includes(APP_TEXTS.dashboard.reports.pagination.next)
    );

    prevBtn?.click();
    expect(emitSpy).toHaveBeenCalledWith(0);

    nextBtn?.click();
    expect(emitSpy).toHaveBeenCalledWith(2);
  });
});
