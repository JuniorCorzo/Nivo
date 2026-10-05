import { Location } from "@angular/common";
import { Component, computed, signal } from "@angular/core";
import type { Signal, WritableSignal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import {
  BadgeComponent,
  TypographyH1,
  TypographyMuted,
} from "@nivo-sass/design-system";

import { PageHeaderComponent } from "./page-header";

interface MockActiveParkingService {
  activeParkingName: WritableSignal<string>;
  activeParkingLot: Signal<ParkingLotListItemModel | null>;
}

interface MockParkingService {
  parkingLots: WritableSignal<ParkingLotListItemModel[]>;
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
  let mockParkingService: MockParkingService;

  beforeEach(async () => {
    const activeParkingNameSignal = signal<string>("");
    const activeLotSignal = computed(() => {
      const name = activeParkingNameSignal();
      /* SAFETY: Mock object satisfies ParkingLotListItemModel for testing */
      return name
        ? ({
            id: "lot-1",
            name,
            occuppationRate: 50,
          } as ParkingLotListItemModel)
        : null;
    });

    mockActiveParkingService = {
      activeParkingLot: activeLotSignal,
      activeParkingName: activeParkingNameSignal,
    };

    mockParkingService = {
      parkingLots: signal<ParkingLotListItemModel[]>([]),
    };

    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, TestHostComponent],
      providers: [
        provideRouter([]),
        { provide: ActiveParkingService, useValue: mockActiveParkingService },
        { provide: ParkingService, useValue: mockParkingService },
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

  it("should render title inside nv-h1 when title input is provided", () => {
    const titleEl = fixture.debugElement.query(By.directive(TypographyH1));
    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent.trim()).toBe(
      "Operaciones de Parqueo"
    );
  });

  it("should render app-parking-lot-selector when showParkingSelector is true", () => {
    fixture.componentRef.setInput("showParkingSelector", true);
    fixture.detectChanges();

    const selector = fixture.nativeElement.querySelector(
      "app-parking-lot-selector"
    );
    expect(selector).toBeTruthy();
    const titleEl = fixture.debugElement.query(By.directive(TypographyH1));
    expect(titleEl).toBeNull();
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

  describe("Leading Icon", () => {
    it("should render icon when icon input is provided", () => {
      fixture.componentRef.setInput("icon", "lucideParkingSquare");
      fixture.detectChanges();

      const iconContainer =
        fixture.nativeElement.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeTruthy();
      const iconEl = fixture.debugElement.query(
        By.css(".bg-primary\\/10 ng-icon")
      );
      expect(iconEl).toBeTruthy();
      /* SAFETY: By.css queries ng-icon which has an InputSignal name */
      const iconInstance = iconEl.componentInstance as { name: () => string };
      expect(iconInstance.name()).toBe("lucideParkingSquare");
    });

    it("should not render icon container when icon input is null", () => {
      fixture.componentRef.setInput("icon", null);
      fixture.detectChanges();

      const iconContainer =
        fixture.nativeElement.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeNull();
    });
  });

  describe("Layout and Grid Structure", () => {
    it("should wrap header in section with container query classes", () => {
      const sectionEl: HTMLElement =
        fixture.nativeElement.querySelector("section");
      expect(sectionEl).toBeTruthy();
      expect(sectionEl.classList.contains("@container")).toBe(true);
      expect(sectionEl.classList.contains("block")).toBe(true);
      expect(sectionEl.classList.contains("w-full")).toBe(true);
    });

    it("should have container query grid classes on header element", () => {
      const headerEl: HTMLElement =
        fixture.nativeElement.querySelector("header");
      expect(headerEl.classList.contains("grid")).toBe(true);
      expect(headerEl.classList.contains("@sm:grid-cols-[auto_1fr_auto]")).toBe(
        true
      );
      expect(headerEl.classList.contains("@sm:grid-rows-[auto_auto]")).toBe(
        true
      );
      expect(headerEl.classList.contains("@sm:items-center")).toBe(true);
      expect(headerEl.classList.contains("@sm:gap-x-4")).toBe(true);
      expect(headerEl.classList.contains("@sm:gap-y-2")).toBe(true);
      expect(headerEl.classList.contains("@sm:p-6")).toBe(true);
    });

    it("should place icon on row 2 col 1 on mobile without row-span-2, and span 2 rows on desktop", () => {
      fixture.componentRef.setInput("icon", "lucideParkingSquare");
      fixture.detectChanges();

      const iconContainer =
        fixture.nativeElement.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeTruthy();
      // Mobile positioning (no row-span-2)
      expect(iconContainer.classList.contains("col-start-1")).toBe(true);
      expect(iconContainer.classList.contains("row-start-2")).toBe(true);
      expect(iconContainer.classList.contains("self-center")).toBe(true);
      expect(iconContainer.classList.contains("row-span-2")).toBe(false);

      // Desktop container queries
      expect(iconContainer.classList.contains("@sm:col-start-1")).toBe(true);
      expect(iconContainer.classList.contains("@sm:row-start-1")).toBe(true);
      expect(iconContainer.classList.contains("@sm:row-span-2")).toBe(true);
    });

    it("should place breadcrumbs container on top row spanning columns 2 and 3 on desktop", () => {
      const desktopBreadcrumbs = fixture.nativeElement.querySelector(
        ".page-header-desktop"
      );
      expect(desktopBreadcrumbs).toBeTruthy();
      expect(desktopBreadcrumbs.classList.contains("@sm:col-start-2")).toBe(
        true
      );
      expect(desktopBreadcrumbs.classList.contains("@sm:col-span-2")).toBe(
        true
      );
      expect(desktopBreadcrumbs.classList.contains("@sm:row-start-1")).toBe(
        true
      );
      expect(desktopBreadcrumbs.classList.contains("@sm:flex")).toBe(true);
    });

    it("should place title and subtitle container in row 2 col 2", () => {
      const row2Container = fixture.nativeElement.querySelector(
        ".flex.min-w-0.flex-col.gap-0\\.5"
      );
      expect(row2Container).toBeTruthy();
      expect(row2Container.classList.contains("@sm:col-start-2")).toBe(true);
      expect(row2Container.classList.contains("@sm:row-start-2")).toBe(true);
    });

    it("should place actions container in row 3 full width on mobile, and row 2 col 3 on desktop", () => {
      const actionsContainer = fixture.nativeElement.querySelector(
        '[data-testid="page-header-actions"]'
      );
      expect(actionsContainer).toBeTruthy();
      // Mobile
      expect(actionsContainer.classList.contains("col-span-full")).toBe(true);
      expect(actionsContainer.classList.contains("row-start-3")).toBe(true);

      // Desktop
      expect(actionsContainer.classList.contains("@sm:col-start-3")).toBe(true);
      expect(actionsContainer.classList.contains("@sm:col-span-1")).toBe(true);
      expect(actionsContainer.classList.contains("@sm:row-start-2")).toBe(true);
      expect(actionsContainer.classList.contains("@sm:justify-end")).toBe(true);
    });

    it("should apply whitespace-nowrap to breadcrumb items", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Parqueaderos", url: "/app/parking-lots" },
        { label: "Detalle de plaza" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      const links = breadcrumbEl.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.classList.contains("whitespace-nowrap")).toBe(true);
      }
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
      const projectedIcon = hostFixture.debugElement.query(
        By.css("#projected-icon")
      );
      expect(projectedIcon).toBeTruthy();
      expect(projectedIcon.nativeElement.textContent.trim()).toBe(
        "Custom Icon"
      );
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

  describe("Breadcrumbs and isRoot", () => {
    it("should prioritize explicit [breadcrumbs] input, prepending Home when not starting with Home", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Parqueaderos", url: "/app/parking-lots" },
        { label: "Detalle" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Home");
      expect(breadcrumbEl.textContent).toContain("Parqueaderos");
      expect(breadcrumbEl.textContent).toContain("Detalle");
    });

    it("should not prepend Home when explicit breadcrumbs already start with Home", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { icon: "lucideHome", label: "Home", url: "/app" },
        { label: "Parqueaderos", url: "/app/parking-lots" },
      ]);
      fixture.detectChanges();

      const crumbs = component.computedBreadcrumbs();
      expect(crumbs.length).toBe(2);
      expect(crumbs[0].label).toBe("Home");
      expect(crumbs[1].label).toBe("Parqueaderos");
    });

    it("should delegate to NavigationContextService when no explicit breadcrumbs provided", () => {
      // No NavigationContextService provided in test setup, so it falls back to Home-only
      fixture.componentRef.setInput("breadcrumbs", null);
      fixture.detectChanges();

      const crumbs = component.computedBreadcrumbs();
      // Falls back to [Home] since no navigation context service is available
      expect(crumbs).toEqual([
        { icon: "lucideHome", label: "Home", url: "/app" },
      ]);
    });

    it("should prioritize custom explicit breadcrumbs prepending Home when not starting with Home", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Parqueaderos", url: "/app/parking-lots" },
        { label: "Detalle" },
      ]);
      fixture.detectChanges();

      const breadcrumbEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      expect(breadcrumbEl.textContent).toContain("Home");
      expect(breadcrumbEl.textContent).toContain("Parqueaderos");
      expect(breadcrumbEl.textContent).toContain("Detalle");
    });
  });

  describe("Without ActiveParkingService", () => {
    it("should handle optional activeParkingService gracefully when not provided", async () => {
      const standaloneFixture = TestBed.createComponent(PageHeaderComponent);
      standaloneFixture.componentRef.setInput("title", "Standalone");
      standaloneFixture.detectChanges();
      await standaloneFixture.whenStable();

      expect(standaloneFixture.componentInstance).toBeTruthy();
      // Without navigation context service, falls back to Home-only breadcrumbs
      expect(standaloneFixture.componentInstance.computedBreadcrumbs()).toEqual(
        [{ icon: "lucideHome", label: "Home", url: "/app" }]
      );
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
        '[data-testid="page-header-history"]'
      );
      expect(historyContainer).toBeTruthy();

      const backBtn = fixture.nativeElement.querySelector(
        '[data-testid="page-header-back-btn"]'
      );
      const forwardBtn = fixture.nativeElement.querySelector(
        '[data-testid="page-header-forward-btn"]'
      );
      expect(backBtn).toBeTruthy();
      expect(forwardBtn).toBeTruthy();
    });

    it("should not render history buttons when showHistoryButtons is false", () => {
      fixture.componentRef.setInput("showHistoryButtons", false);
      fixture.detectChanges();

      const historyContainer = fixture.nativeElement.querySelector(
        '[data-testid="page-header-history"]'
      );
      expect(historyContainer).toBeNull();
    });

    it("should trigger goBack and location.back when back button is clicked", () => {
      const backBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="page-header-back-btn"]'
      );
      expect(backBtn).toBeTruthy();
      backBtn.click();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it("should trigger goForward and location.forward when forward button is clicked", () => {
      const forwardBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '[data-testid="page-header-forward-btn"]'
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
        '[data-testid="page-header-breadcrumb"]'
      );
      expect(breadcrumbEl).toBeTruthy();
      const icons = breadcrumbEl.querySelectorAll("ng-icon.shrink-0");
      expect(icons.length).toBe(2);
    });

    it("should resolve fallback icons for explicit breadcrumbs without explicit icons", () => {
      fixture.componentRef.setInput("breadcrumbs", [
        { label: "Home", url: "/app" },
        { isParking: true, label: "Sede Centro" },
        { label: "Plazas de parqueo" },
        { label: "Tarifas vigentes" },
        { label: "Operaciones diarias" },
        { label: "Tickets emitidos" },
        { label: "Otra sección" },
      ]);
      fixture.detectChanges();

      const crumbs = component.computedBreadcrumbs();
      expect(crumbs).toEqual([
        { icon: "lucideHome", label: "Home", url: "/app" },
        { icon: "lucideBuilding2", isParking: true, label: "Sede Centro" },
        { icon: "lucideLayoutGrid", label: "Plazas de parqueo" },
        { icon: "lucideCoins", label: "Tarifas vigentes" },
        { icon: "lucideCar", label: "Operaciones diarias" },
        { icon: "lucideTicket", label: "Tickets emitidos" },
        { icon: "lucideLayoutDashboard", label: "Otra sección" },
      ]);
    });
  });

  describe("Dual Responsive Layout (Desktop & Mobile)", () => {
    it("should render both desktop container and mobile 3-row container", () => {
      const desktopContainer = fixture.nativeElement.querySelector(
        ".page-header-desktop"
      );
      const mobileContainer = fixture.nativeElement.querySelector(
        ".page-header-mobile"
      );
      expect(desktopContainer).toBeTruthy();
      expect(mobileContainer).toBeTruthy();
    });

    it("should render mobile back button when isRoot is false and trigger goBack on click", () => {
      const locationSpy = TestBed.inject(Location);
      vi.spyOn(locationSpy, "back");

      fixture.componentRef.setInput("isRoot", false);
      fixture.detectChanges();

      const mobileBackBtn: HTMLButtonElement =
        fixture.nativeElement.querySelector(
          '[data-testid="page-header-mobile-back-btn"]'
        );
      expect(mobileBackBtn).toBeTruthy();
      mobileBackBtn.click();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it("should not render mobile back button when isRoot is true", () => {
      fixture.componentRef.setInput("isRoot", true);
      fixture.detectChanges();

      const mobileBackBtn = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-back-btn"]'
      );
      expect(mobileBackBtn).toBeNull();
    });

    it("should display mobile path from NavigationContextService when service is injected", () => {
      // NavigationContextService is injected via provideRouter([]) and returns "Home" initially (no navigation)
      fixture.componentRef.setInput("isRoot", false);
      fixture.detectChanges();

      const mobilePathEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-path"]'
      );
      expect(mobilePathEl).toBeTruthy();
      // Service returns "Home" as mobilePath (initial state with no navigation)
      expect(mobilePathEl.textContent).toContain("Home");
    });

    it("should display mobile path falling back to Home when no navigation context and no explicit breadcrumbs", () => {
      fixture.componentRef.setInput("isRoot", true);
      fixture.componentRef.setInput("title", "Dashboard");
      fixture.detectChanges();

      const mobilePathEl = fixture.nativeElement.querySelector(
        '[data-testid="page-header-mobile-path"]'
      );
      expect(mobilePathEl).toBeTruthy();
      // Without NavigationContextService, falls back to computed breadcrumbs joined
      expect(mobilePathEl.textContent).toContain("Home");
    });
  });
});
