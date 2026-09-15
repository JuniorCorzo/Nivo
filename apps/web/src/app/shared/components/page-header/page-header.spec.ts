import { Location } from "@angular/common";
import { Component, signal } from "@angular/core";
import type { WritableSignal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { BadgeComponent, TypographyH1, TypographyMuted } from "@nivo-sass/design-system";

import { PageHeaderComponent } from "./page-header";

interface MockActiveParkingService {
  activeParkingName: WritableSignal<string>;
}

@Component({
  imports: [PageHeaderComponent],
  standalone: true,
  template: `
    <app-page-header [title]="hostTitle">
      <span icon id="projected-icon">Custom Icon</span>
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
    expect(titleEl.nativeElement.textContent.trim()).toBe("Operaciones de Parqueo");
  });

  it("should render subtitle when subtitle input is provided", () => {
    fixture.componentRef.setInput("subtitle", "Subtítulo de prueba");
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(By.directive(TypographyMuted));
    expect(subtitleEl).toBeTruthy();
    expect(subtitleEl.nativeElement.textContent.trim()).toBe("Subtítulo de prueba");
  });

  it("should not render nv-muted when subtitle input is null", () => {
    fixture.componentRef.setInput("subtitle", null);
    fixture.detectChanges();

    const subtitleEl = fixture.debugElement.query(By.directive(TypographyMuted));
    expect(subtitleEl).toBeNull();
  });

  describe("Leading Icon", () => {
    it("should render icon when icon input is provided", () => {
      fixture.componentRef.setInput("icon", "lucideParkingSquare");
      fixture.detectChanges();

      const iconContainer = fixture.nativeElement.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeTruthy();
      const iconEl = fixture.debugElement.query(By.css(".bg-primary\\/10 ng-icon"));
      expect(iconEl).toBeTruthy();
      /* SAFETY: By.css queries ng-icon which has an InputSignal name */
      const iconInstance = iconEl.componentInstance as { name: () => string };
      expect(iconInstance.name()).toBe("lucideParkingSquare");
    });

    it("should not render icon container when icon input is null", () => {
      fixture.componentRef.setInput("icon", null);
      fixture.detectChanges();

      const iconContainer = fixture.nativeElement.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeNull();
    });
  });

  describe("Back Link above title", () => {
    it("should not render back button when backLink is null", () => {
      fixture.componentRef.setInput("backLink", null);
      fixture.detectChanges();

      const backButton = fixture.debugElement.query(By.css("a[aria-label]"));
      expect(backButton).toBeNull();
    });

    it("should render back link above title when backLink is provided", () => {
      fixture.componentRef.setInput("backLink", "/app/parking-lots");
      fixture.componentRef.setInput("backAriaLabel", "Volver al listado");
      fixture.detectChanges();

      const backButton = fixture.debugElement.query(By.css("a"));
      expect(backButton).toBeTruthy();
      expect(backButton.nativeElement.getAttribute("href")).toBe("/app/parking-lots");
      expect(backButton.nativeElement.getAttribute("aria-label")).toBe("Volver al listado");
      expect(backButton.nativeElement.textContent).toContain("Volver al listado");

      const arrowIcon = backButton.query(By.css('ng-icon[name="lucideArrowLeft"]'));
      expect(arrowIcon).toBeTruthy();
    });
  });

  describe("Badges", () => {
    it("should render badge input with default info variant", () => {
      fixture.componentRef.setInput("badge", "En vivo");
      fixture.detectChanges();

      const badgeEl = fixture.debugElement.query(By.directive(BadgeComponent));
      expect(badgeEl).toBeTruthy();
      expect(badgeEl.nativeElement.textContent.trim()).toBe("En vivo");

      /* SAFETY: By.directive(BadgeComponent) ensures componentInstance is of type BadgeComponent */
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

      /* SAFETY: By.directive(BadgeComponent) ensures componentInstance is of type BadgeComponent */
      const badgeInstance = badgeEl.componentInstance as BadgeComponent;
      expect(badgeInstance.variant()).toBe("destructive");
    });

    it("should not render nv-badge when badge input is null", () => {
      fixture.componentRef.setInput("badge", null);
      fixture.detectChanges();

      const badgeEl = fixture.debugElement.query(By.directive(BadgeComponent));
      expect(badgeEl).toBeNull();
    });
  });

  describe("Content projection with TestHostComponent", () => {
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it("should project leading icon via [icon] slot when icon input is not used", () => {
      const projectedIcon = hostFixture.debugElement.query(By.css("#projected-icon"));
      expect(projectedIcon).toBeTruthy();
      expect(projectedIcon.nativeElement.textContent.trim()).toBe("Custom Icon");
    });

    it("should project badge via [badge] slot when badge input is not used", () => {
      const projectedBadge = hostFixture.debugElement.query(By.css("#projected-badge"));
      expect(projectedBadge).toBeTruthy();
      expect(projectedBadge.nativeElement.textContent.trim()).toBe("Custom Badge");
    });

    it("should project subtitle via [subtitle] slot when subtitle input is not used", () => {
      const projectedSubtitle = hostFixture.debugElement.query(By.css("#projected-subtitle"));
      expect(projectedSubtitle).toBeTruthy();
      expect(projectedSubtitle.nativeElement.textContent.trim()).toBe("Custom Subtitle");
    });

    it("should project actions via [actions] slot", () => {
      const projectedActions = hostFixture.debugElement.query(By.css("#projected-actions"));
      expect(projectedActions).toBeTruthy();
      expect(projectedActions.nativeElement.textContent).toContain("Custom Action");
    });

    it("should project unslotted content into default slot", () => {
      const defaultContent = hostFixture.debugElement.query(By.css("#projected-default"));
      expect(defaultContent).toBeTruthy();
      expect(defaultContent.nativeElement.textContent.trim()).toBe("Default Content");
    });
  });

  describe("Breadcrumbs and isRoot", () => {
    it("should not render breadcrumbs by default when backLink is not provided", () => {
      mockActiveParkingService.activeParkingName.set("Sede Central");
      fixture.componentRef.setInput("title", "Dashboard");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeNull();
    });

    it("should not render breadcrumbs when isRoot is true, even with backLink and parking name", () => {
      mockActiveParkingService.activeParkingName.set("Sede Central");
      fixture.componentRef.setInput("backLink", "/app/parking-lots");
      fixture.componentRef.setInput("isRoot", true);
      fixture.componentRef.setInput("title", "Dashboard");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeNull();
    });

    it("should render automatic breadcrumb when backLink is present and isRoot is false", () => {
      mockActiveParkingService.activeParkingName.set("Sede Central");
      fixture.componentRef.setInput("backLink", "/app/parking-lots");
      fixture.componentRef.setInput("isRoot", false);
      fixture.componentRef.setInput("title", "Plazas");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Sede Central");
      expect(breadcrumbEl.textContent).toContain("Plazas");
    });

    it("should render fallback breadcrumb with only title when no active parking exists and backLink is present", () => {
      mockActiveParkingService.activeParkingName.set("");
      fixture.componentRef.setInput("backLink", "/app/parking-lots");
      fixture.componentRef.setInput("isRoot", false);
      fixture.componentRef.setInput("title", "Configuración");
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).not.toContain("Sede Central");
      expect(breadcrumbEl.textContent).toContain("Configuración");
    });

    it("should prioritize custom explicit breadcrumbs when provided", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Parqueaderos", url: "/app/parking-lots" },
        { label: "Detalle" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Parqueaderos");
      expect(breadcrumbEl.textContent).toContain("Detalle");
    });
  });

  describe("Without ActiveParkingService", () => {
    it("should handle optional activeParkingService gracefully when not provided", async () => {
      const standaloneFixture = TestBed.createComponent(PageHeaderComponent);
      standaloneFixture.componentRef.setInput("title", "Standalone");
      standaloneFixture.componentRef.setInput("backLink", "/app/somewhere");
      standaloneFixture.detectChanges();
      await standaloneFixture.whenStable();

      expect(standaloneFixture.componentInstance).toBeTruthy();
      expect(standaloneFixture.componentInstance.computedBreadcrumbs()).toEqual([
        { label: "Standalone" },
      ]);
    });
  });

  describe("History Navigation Buttons", () => {
    let locationSpy: Location;

    beforeEach(() => {
      locationSpy = TestBed.inject(Location);
      vi.spyOn(locationSpy, "back");
      vi.spyOn(locationSpy, "forward");
    });

    it("should render history buttons by default", () => {
      const historyContainer = fixture.nativeElement.querySelector(
        '[data-testid="page-header-history"]',
      );
      expect(historyContainer).toBeTruthy();

      const backBtn = fixture.nativeElement.querySelector('[data-testid="page-header-back-btn"]');
      const forwardBtn = fixture.nativeElement.querySelector(
        '[data-testid="page-header-forward-btn"]',
      );
      expect(backBtn).toBeTruthy();
      expect(forwardBtn).toBeTruthy();
    });

    it("should not render history buttons when showHistoryButtons is false", () => {
      fixture.componentRef.setInput("showHistoryButtons", false);
      fixture.detectChanges();

      const historyContainer = fixture.nativeElement.querySelector(
        '[data-testid="page-header-history"]',
      );
      expect(historyContainer).toBeNull();
    });

    it("should trigger goBack and location.back when back button is clicked", () => {
      const backBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="page-header-back-btn"]',
      );
      expect(backBtn).toBeTruthy();
      backBtn.click();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it("should trigger goForward and location.forward when forward button is clicked", () => {
      const forwardBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="page-header-forward-btn"]',
      );
      expect(forwardBtn).toBeTruthy();
      forwardBtn.click();
      expect(locationSpy.forward).toHaveBeenCalled();
    });
  });

  describe("Breadcrumb item icons", () => {
    it("should render icon in breadcrumb item when icon is defined", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { icon: "lucideParkingSquare", label: "Inicio", url: "/app" },
        { icon: "lucideCar", label: "Detalle" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]',
      );
      expect(breadcrumbEl).toBeTruthy();
      const icons = breadcrumbEl.querySelectorAll("ng-icon");
      expect(icons.length).toBe(2);
    });
  });

  describe("Dual Responsive Layout (Desktop & Mobile)", () => {
    it("should render both desktop container and mobile 3-row container", () => {
      const desktopContainer = fixture.nativeElement.querySelector(".page-header-desktop");
      const mobileContainer = fixture.nativeElement.querySelector(".page-header-mobile");
      expect(desktopContainer).toBeTruthy();
      expect(mobileContainer).toBeTruthy();
    });

    it("should render mobile back button when isRoot is false and trigger goBack on click", () => {
      const locationSpy = TestBed.inject(Location);
      vi.spyOn(locationSpy, "back");

      fixture.componentRef.setInput("isRoot", false);
      fixture.detectChanges();

      const mobileBackBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-back-btn"]',
      );
      expect(mobileBackBtn).toBeTruthy();
      mobileBackBtn.click();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it("should not render mobile back button when isRoot is true", () => {
      fixture.componentRef.setInput("isRoot", true);
      fixture.detectChanges();

      const mobileBackBtn = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-back-btn"]',
      );
      expect(mobileBackBtn).toBeNull();
    });

    it("should display mobile path derived from breadcrumbs or title", () => {
      mockActiveParkingService.activeParkingName.set("Central Norte");
      fixture.componentRef.setInput("backLink", "/app/parking-lots");
      fixture.componentRef.setInput("title", "Operaciones");
      fixture.detectChanges();

      const mobilePathEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-path"]',
      );
      expect(mobilePathEl).toBeTruthy();
      expect(mobilePathEl.textContent).toContain("Central Norte / Operaciones");
    });
  });
});
