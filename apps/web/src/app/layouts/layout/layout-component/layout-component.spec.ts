import { BreakpointObserver, type BreakpointState } from "@angular/cdk/layout";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NavigationEnd, Router, provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { BehaviorSubject, Subject } from "rxjs";

import { LayoutComponent } from "./layout-component";

describe("LayoutComponent", () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let breakpointSubject: BehaviorSubject<BreakpointState>;
  let routerEventsSubject: Subject<unknown>;
  let activeParkingNameSignal: ReturnType<typeof signal<string>>;

  beforeEach(async () => {
    breakpointSubject = new BehaviorSubject<BreakpointState>({
      breakpoints: {},
      matches: false,
    });
    routerEventsSubject = new Subject<unknown>();
    activeParkingNameSignal = signal<string>("Central Parking");

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: BreakpointObserver,
          useValue: {
            isMatched: () => breakpointSubject.value.matches,
            observe: () => breakpointSubject.asObservable(),
          },
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingName: activeParkingNameSignal,
            hasActiveParking: signal(true),
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    Object.defineProperty(router, "events", {
      value: routerEventsSubject.asObservable(),
    });

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Desktop mode (>=768px)", () => {
    beforeEach(async () => {
      breakpointSubject.next({ breakpoints: {}, matches: false });
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should set isMobile to false", () => {
      expect(component.isMobile()).toBe(false);
    });

    it("should not render mobile top bar", () => {
      const topBar = fixture.debugElement.query(By.css("header"));
      expect(topBar).toBeNull();
    });

    it("should render permanent sidebar in the desktop horizontal layout", () => {
      const desktopSidebar = fixture.debugElement.query(
        By.css("main router-outlet[name='sidebar']")
      );
      expect(desktopSidebar).toBeTruthy();
    });

    it("should not render mobile drawer or backdrop", () => {
      const backdrop = fixture.debugElement.query(
        By.css("[data-testid='drawer-backdrop']")
      );
      expect(backdrop).toBeNull();
    });
  });

  describe("Mobile mode (<768px)", () => {
    beforeEach(async () => {
      breakpointSubject.next({ breakpoints: {}, matches: true });
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should set isMobile to true", () => {
      expect(component.isMobile()).toBe(true);
    });

    it("should render mobile top bar with height h-14 and border-b", () => {
      const topBar = fixture.debugElement.query(By.css("header"));
      expect(topBar).toBeTruthy();
      expect(topBar.nativeElement.classList.contains("h-14")).toBe(true);
      expect(topBar.nativeElement.classList.contains("border-b")).toBe(true);
    });

    it("should render logo Nivo in top bar", () => {
      const logoLink = fixture.debugElement.query(
        By.css("header a[aria-label='Nivo']")
      );
      expect(logoLink).toBeTruthy();
      expect(logoLink.nativeElement.textContent).toContain("Nivo");
    });

    it("should render hamburger button with correct aria-label", () => {
      const hamburger = fixture.debugElement.query(
        By.css("header button[aria-label='Abrir menú de navegación']")
      );
      expect(hamburger).toBeTruthy();
    });

    it("should render active parking name badge when available", () => {
      const badge = fixture.debugElement.query(
        By.css("header nv-badge")
      );
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent).toContain("Central Parking");
    });

    it("should not render active parking badge when name is empty", async () => {
      activeParkingNameSignal.set("");
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.debugElement.query(By.css("header nv-badge"));
      expect(badge).toBeNull();
    });

    it("should not render desktop permanent sidebar", () => {
      const desktopSidebar = fixture.debugElement.query(
        By.css("main > router-outlet[name='sidebar']")
      );
      expect(desktopSidebar).toBeNull();
    });

    it("should initially keep mobileDrawerOpen as false and not render drawer or backdrop", () => {
      expect(component.mobileDrawerOpen()).toBe(false);
      const backdrop = fixture.debugElement.query(
        By.css("[data-testid='drawer-backdrop']")
      );
      expect(backdrop).toBeNull();
    });
  });

  describe("Mobile Drawer Interactions", () => {
    beforeEach(async () => {
      breakpointSubject.next({ breakpoints: {}, matches: true });
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it("should open drawer and render backdrop and sidebar outlet when hamburger is clicked", async () => {
      const hamburger = fixture.debugElement.query(
        By.css("header button[aria-label='Abrir menú de navegación']")
      );
      expect(hamburger).toBeTruthy();

      hamburger.nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.mobileDrawerOpen()).toBe(true);

      const backdrop = fixture.debugElement.query(
        By.css("[data-testid='drawer-backdrop']")
      );
      expect(backdrop).toBeTruthy();
      expect(backdrop.nativeElement.className).toContain("bg-black/50");
      expect(backdrop.nativeElement.className).toContain("backdrop-blur-xs");

      const drawerSidebar = fixture.debugElement.query(
        By.css("[role='dialog'] router-outlet[name='sidebar']")
      );
      expect(drawerSidebar).toBeTruthy();
    });

    it("should close drawer when backdrop is clicked", async () => {
      component.openDrawer();
      fixture.detectChanges();
      await fixture.whenStable();

      const backdrop = fixture.debugElement.query(
        By.css("[data-testid='drawer-backdrop']")
      );
      expect(backdrop).toBeTruthy();

      backdrop.nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.mobileDrawerOpen()).toBe(false);
      const closedBackdrop = fixture.debugElement.query(
        By.css("[data-testid='drawer-backdrop']")
      );
      expect(closedBackdrop).toBeNull();
    });

    it("should close drawer when Escape key is pressed", async () => {
      component.openDrawer();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.mobileDrawerOpen()).toBe(true);

      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(escapeEvent);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.mobileDrawerOpen()).toBe(false);
    });

    it("should close drawer when NavigationEnd event is emitted", async () => {
      component.openDrawer();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.mobileDrawerOpen()).toBe(true);

      routerEventsSubject.next(
        new NavigationEnd(1, "/app/tickets", "/app/tickets")
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.mobileDrawerOpen()).toBe(false);
    });
  });
});
