import { Component, signal } from "@angular/core";
import type { WritableSignal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import {
  BadgeComponent,
  TypographyH1,
  TypographyMuted,
} from "@nivo-sass/design-system";

import { PageHeaderComponent } from "./page-header.component";

interface MockActiveParkingService {
  activeParkingName: WritableSignal<string>;
}

@Component({
  imports: [PageHeaderComponent],
  standalone: true,
  template: `
    <app-page-header [title]="hostTitle">
      <span badge id="projected-badge">Custom Badge</span>
      <span subtitle id="projected-subtitle">Custom Subtitle</span>
      <div actions id="projected-actions">
        <button type="button">Custom Action</button>
      </div>
      <div id="projected-default">Default Content</div>
    </app-page-header>
  `,
})
class TestHostComponent {
  readonly hostTitle = "Host Title";
}

describe("PageHeaderComponent", () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;
  let mockActiveParkingService: MockActiveParkingService;

  beforeEach(async () => {
    mockActiveParkingService = {
      activeParkingName: signal<string>(""),
    };

    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, TestHostComponent],
      providers: [
        provideRouter([]),
        { provide: ActiveParkingService, useValue: mockActiveParkingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("title", "Operaciones de Parqueo");
    fixture.detectChanges();
  });

  it("should create PageHeaderComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render required title inside nv-h1", () => {
    const titleEl = fixture.debugElement.query(By.directive(TypographyH1));
    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent.trim()).toBe(
      "Operaciones de Parqueo"
    );
  });

  it("should render subtitle when subtitle input is provided", () => {
    fixture.componentRef.setInput("subtitle", "Subtítulo de prueba");
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(
      By.directive(TypographyMuted)
    );
    expect(subtitleEl).toBeTruthy();
    expect(subtitleEl.nativeElement.textContent.trim()).toBe(
      "Subtítulo de prueba"
    );
  });

  it("should not render nv-muted when subtitle input is null", () => {
    fixture.componentRef.setInput("subtitle", null);
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(
      By.directive(TypographyMuted)
    );
    expect(subtitleEl).toBeNull();
  });

  it("should not render back button when backLink is null", () => {
    fixture.componentRef.setInput("backLink", null);
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css("a[aria-label]"));
    expect(backButton).toBeNull();
  });

  it("should render back button when backLink is provided", () => {
    fixture.componentRef.setInput("backLink", "/app/parking-lots");
    fixture.componentRef.setInput("backAriaLabel", "Volver al listado");
    fixture.detectChanges();

    const backButton = fixture.debugElement.query(By.css("a"));
    expect(backButton).toBeTruthy();
    expect(backButton.nativeElement.getAttribute("href")).toBe(
      "/app/parking-lots"
    );
    expect(backButton.nativeElement.getAttribute("aria-label")).toBe(
      "Volver al listado"
    );
  });

  it("should render badge input with default info variant", () => {
    fixture.componentRef.setInput("badge", "En vivo");
    fixture.detectChanges();

    const badgeEl = fixture.debugElement.query(By.directive(BadgeComponent));
    expect(badgeEl).toBeTruthy();
    expect(badgeEl.nativeElement.textContent.trim()).toBe("En vivo");

    // SAFETY: By.directive(BadgeComponent) queries for BadgeComponent, ensuring componentInstance is of this type.
    const badgeInstance = badgeEl.componentInstance as BadgeComponent;
    expect(badgeInstance.variant()).toBe("info");
  });

  it("should render badge with specified custom variant", () => {
    fixture.componentRef.setInput("badge", "Alerta");
    fixture.componentRef.setInput("badgeVariant", "destructive");
    fixture.detectChanges();

    const badgeEl = fixture.debugElement.query(By.directive(BadgeComponent));
    expect(badgeEl).toBeTruthy();
    expect(badgeEl.nativeElement.textContent.trim()).toBe("Alerta");

    // SAFETY: By.directive(BadgeComponent) queries for BadgeComponent, ensuring componentInstance is of this type.
    const badgeInstance = badgeEl.componentInstance as BadgeComponent;
    expect(badgeInstance.variant()).toBe("destructive");
  });

  it("should not render nv-badge when badge input is null", () => {
    fixture.componentRef.setInput("badge", null);
    fixture.detectChanges();

    const badgeEl = fixture.debugElement.query(By.directive(BadgeComponent));
    expect(badgeEl).toBeNull();
  });

  describe("Content projection with TestHostComponent", () => {
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it("should project badge via [badge] slot when badge input is not used", () => {
      const projectedBadge = hostFixture.debugElement.query(
        By.css("#projected-badge")
      );
      expect(projectedBadge).toBeTruthy();
      expect(projectedBadge.nativeElement.textContent.trim()).toBe(
        "Custom Badge"
      );
    });

    it("should project subtitle via [subtitle] slot when subtitle input is not used", () => {
      const projectedSubtitle = hostFixture.debugElement.query(
        By.css("#projected-subtitle")
      );
      expect(projectedSubtitle).toBeTruthy();
      expect(projectedSubtitle.nativeElement.textContent.trim()).toBe(
        "Custom Subtitle"
      );
    });

    it("should project actions via [actions] slot", () => {
      const projectedActions = hostFixture.debugElement.query(
        By.css("#projected-actions")
      );
      expect(projectedActions).toBeTruthy();
      expect(projectedActions.nativeElement.textContent).toContain(
        "Custom Action"
      );
    });

    it("should project unslotted content into default slot", () => {
      const defaultContent = hostFixture.debugElement.query(
        By.css("#projected-default")
      );
      expect(defaultContent).toBeTruthy();
      expect(defaultContent.nativeElement.textContent.trim()).toBe(
        "Default Content"
      );
    });
  });

  describe("Breadcrumbs", () => {
    it("should render reactive breadcrumb with active parking lot name and title by default", () => {
      mockActiveParkingService.activeParkingName.set("Sede Central");
      fixture.componentRef.setInput("title", "Dashboard");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Sede Central");
      expect(breadcrumbEl.textContent).toContain("Dashboard");
    });

    it("should render fallback breadcrumb with only title when no active parking exists", () => {
      mockActiveParkingService.activeParkingName.set("");
      fixture.componentRef.setInput("title", "Dashboard");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).not.toContain("Sede Central");
      expect(breadcrumbEl.textContent).toContain("Dashboard");
    });

    it("should render custom explicit breadcrumbs when provided", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Parqueaderos", url: "/app/parking-lots" },
        { label: "Detalle" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Parqueaderos");
      expect(breadcrumbEl.textContent).toContain("Detalle");
    });
  });
});
