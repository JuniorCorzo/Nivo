import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NavigationEnd, Router, provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { UserService } from "@core/services/user/user-service";
import { Subject } from "rxjs";

import { SidebarBase } from "../sidebar-base/sidebar-base";
import { SidebarMobile } from "./sidebar-mobile";

describe("SidebarMobile", () => {
  let component: SidebarMobile;
  let fixture: ComponentFixture<SidebarMobile>;
  let routerEventsSubject: Subject<unknown>;
  let activeParkingNameSignal: ReturnType<typeof signal<string>>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<unknown>();
    activeParkingNameSignal = signal<string>("Central Parking");

    await TestBed.configureTestingModule({
      imports: [SidebarMobile],
      providers: [
        provideRouter([]),
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingName: activeParkingNameSignal,
          },
        },
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    Object.defineProperty(router, "events", {
      value: routerEventsSubject.asObservable(),
    });

    fixture = TestBed.createComponent(SidebarMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render header with burger button and logo", () => {
    const header = fixture.debugElement.query(By.css("header"));
    expect(header).toBeTruthy();
    expect(header.nativeElement.classList.contains("h-14")).toBe(true);

    const burger = header.query(
      By.css("button[aria-label='Abrir menú de navegación']")
    );
    expect(burger).toBeTruthy();

    const logo = header.query(By.css("a[aria-label='Nivo']"));
    expect(logo).toBeTruthy();
  });

  it("should render active parking name badge when available", () => {
    const badge = fixture.debugElement.query(By.css("header nv-badge"));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain("Central Parking");
  });

  it("should not render active parking badge when name is empty", () => {
    activeParkingNameSignal.set("");
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css("header nv-badge"));
    expect(badge).toBeNull();
  });

  it("should open drawer when burger button is clicked", () => {
    const burger = fixture.debugElement.query(
      By.css("button[aria-label='Abrir menú de navegación']")
    );
    burger.nativeElement.click();
    fixture.detectChanges();

    expect(component.mobileDrawerOpen()).toBe(true);

    const dialog = fixture.debugElement.query(By.css("[role='dialog']"));
    expect(dialog).toBeTruthy();

    const baseEl = dialog.query(By.directive(SidebarBase));
    expect(baseEl).toBeTruthy();
    /* SAFETY: By.directive(SidebarBase) ensures componentInstance is SidebarBase */
    const baseInstance = baseEl.componentInstance as SidebarBase;
    expect(baseInstance.collapsed()).toBe(false);
  });

  it("should close drawer when backdrop is clicked", () => {
    component.openDrawer();
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(
      By.css("[data-testid='drawer-backdrop']")
    );
    expect(backdrop).toBeTruthy();

    backdrop.nativeElement.click();
    fixture.detectChanges();

    expect(component.mobileDrawerOpen()).toBe(false);
  });

  it("should close drawer when close button inside drawer is clicked", () => {
    component.openDrawer();
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(
      By.css("button[aria-label='Cerrar menú de navegación']")
    );
    expect(closeBtn).toBeTruthy();

    closeBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.mobileDrawerOpen()).toBe(false);
  });

  it("should close drawer when Escape key is pressed", () => {
    component.openDrawer();
    fixture.detectChanges();
    expect(component.mobileDrawerOpen()).toBe(true);

    const escapeEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    });
    document.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(component.mobileDrawerOpen()).toBe(false);
  });

  it("should close drawer on NavigationEnd event", () => {
    component.openDrawer();
    fixture.detectChanges();
    expect(component.mobileDrawerOpen()).toBe(true);

    routerEventsSubject.next(
      new NavigationEnd(1, "/app/tickets", "/app/tickets")
    );
    fixture.detectChanges();

    expect(component.mobileDrawerOpen()).toBe(false);
  });
});
