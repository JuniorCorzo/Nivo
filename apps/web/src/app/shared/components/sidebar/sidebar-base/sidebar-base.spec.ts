import { signal } from "@angular/core";
import type { WritableSignal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NavigationEnd, Router, provideRouter } from "@angular/router";
import type { UserModel } from "@core/models/user.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { TicketService } from "@core/services/ticket-service";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { Subject } from "rxjs";

import { SidebarBase } from "./sidebar-base";

const createMockUser = (role: Role): UserModel => ({
  contactInfo: "",
  createdAt: new Date(),
  email: "test@example.com",
  fullName: "Test User",
  id: "u1",
  role,
  tenant: { companyName: "Co", id: "t1" },
  updatedAt: new Date(),
});

describe("SidebarBase", () => {
  let component: SidebarBase;
  let currentUserSignal: WritableSignal<UserModel | null>;
  let activeParkingLotSignal: WritableSignal<any>;
  let activeParkingIdSignal: WritableSignal<string | null>;
  let activeTicketsSignal: WritableSignal<{ id: string }[]>;
  let fixture: ComponentFixture<SidebarBase>;
  let routerEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    currentUserSignal = signal<UserModel | null>(null);
    activeParkingLotSignal = signal<any>(null);
    activeParkingIdSignal = signal<string | null>("p-123");
    activeTicketsSignal = signal<{ id: string }[]>([
      { id: "t-1" },
      { id: "t-2" },
    ]);
    routerEventsSubject = new Subject<unknown>();

    await TestBed.configureTestingModule({
      imports: [SidebarBase],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: currentUserSignal },
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingId: activeParkingIdSignal,
            activeParkingLot: activeParkingLotSignal,
            activeParkingName: signal(""),
          },
        },
        {
          provide: TicketService,
          useValue: {
            activeTickets: activeTicketsSignal,
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    Object.defineProperty(router, "events", {
      value: routerEventsSubject.asObservable(),
    });

    fixture = TestBed.createComponent(SidebarBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render nav items and labels when not collapsed", () => {
    fixture.componentRef.setInput("collapsed", false);
    fixture.detectChanges();

    const navLinks = fixture.debugElement.queryAll(By.css("nav a"));
    expect(navLinks.length).toBeGreaterThan(0);

    const firstLabel = navLinks[0].query(By.css("span"));
    expect(firstLabel).toBeTruthy();
  });

  it("should hide nav item labels when collapsed", () => {
    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const navLinks = fixture.debugElement.queryAll(By.css("nav a"));
    expect(navLinks.length).toBeGreaterThan(0);

    const firstLabel = navLinks[0].query(By.css("span"));
    expect(firstLabel).toBeNull();
  });

  it("should update active nav item on NavigationEnd event", async () => {
    routerEventsSubject.next(
      new NavigationEnd(
        1,
        APP_ROUTES.app.parkingLots,
        APP_ROUTES.app.parkingLots
      )
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const activeItem = component
      .navItems()
      .find((item) => item.url === APP_ROUTES.app.parkingLots);
    expect(activeItem?.isActive).toBe(true);

    const activeLink = fixture.debugElement.query(By.css("nav a.bg-muted"));
    expect(activeLink).toBeTruthy();
  });

  it("should bind collapsed input to sidebar footer", () => {
    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.directive(SidebarFooter));
    expect(footer).toBeTruthy();
    /* SAFETY: By.directive(SidebarFooter) ensures componentInstance is SidebarFooter */
    const footerComponent = footer.componentInstance as SidebarFooter;
    expect(footerComponent.collapsed()).toBe(true);
  });

  it("should hide 'Usuarios y Cajeros' nav item when user is null", () => {
    currentUserSignal.set(null);
    fixture.detectChanges();

    const hasUsersItem = component
      .navItems()
      .some((item) => item.label === "Usuarios y Cajeros");
    expect(hasUsersItem).toBe(false);
  });

  it("should hide 'Usuarios y Cajeros' nav item when user role is OPERATOR", () => {
    currentUserSignal.set(createMockUser("OPERATOR"));
    fixture.detectChanges();

    const hasUsersItem = component
      .navItems()
      .some((item) => item.label === "Usuarios y Cajeros");
    expect(hasUsersItem).toBe(false);
  });

  it("should show 'Usuarios y Cajeros' nav item when user role is MANAGER", () => {
    currentUserSignal.set(createMockUser("MANAGER"));
    fixture.detectChanges();

    const hasUsersItem = component
      .navItems()
      .some((item) => item.label === "Usuarios y Cajeros");
    expect(hasUsersItem).toBe(true);
  });

  it("should show 'Usuarios y Cajeros' nav item when user role is OWNER", () => {
    currentUserSignal.set(createMockUser("OWNER"));
    fixture.detectChanges();

    const hasUsersItem = component
      .navItems()
      .some((item) => item.label === "Usuarios y Cajeros");
    expect(hasUsersItem).toBe(true);
  });

  it("should render group headers when not collapsed and hide them when collapsed", () => {
    fixture.componentRef.setInput("collapsed", false);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css("nav .uppercase"));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent).toContain("Operación Diaria");

    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const collapsedHeader = fixture.debugElement.query(
      By.css("nav .uppercase")
    );
    expect(collapsedHeader).toBeNull();
  });

  it("should not contain 'En Vivo (Barreras)' nav item", () => {
    const enVivoItem = component
      .navItems()
      .find((item) => item.label.includes("En Vivo"));
    expect(enVivoItem).toBeUndefined();
  });

  it("should resolve dynamic routes with active parking lot", () => {
    activeParkingLotSignal.set({ id: "p-456", name: "Lot 456" });
    fixture.detectChanges();

    const ratesItem = component
      .navItems()
      .find((item) => item.label === "Tarifas y Reglas");
    expect(ratesItem?.url).toBe(APP_ROUTES.app.parkingLotRates("p-456"));

    const slotsItem = component
      .navItems()
      .find((item) => item.label === "Plazas & Bahías");
    expect(slotsItem?.url).toBe(APP_ROUTES.app.parkingLotSlots("p-456"));
  });

  it("should resolve dynamic routes with active parking id if lot is null", () => {
    activeParkingLotSignal.set(null);
    activeParkingIdSignal.set("p-789");
    fixture.detectChanges();

    const ratesItem = component
      .navItems()
      .find((item) => item.label === "Tarifas y Reglas");
    expect(ratesItem?.url).toBe(APP_ROUTES.app.parkingLotRates("p-789"));

    const slotsItem = component
      .navItems()
      .find((item) => item.label === "Plazas & Bahías");
    expect(slotsItem?.url).toBe(APP_ROUTES.app.parkingLotSlots("p-789"));
  });

  it("should fallback dynamic routes to parking lots when no active parking id and no active lot", () => {
    activeParkingLotSignal.set(null);
    activeParkingIdSignal.set(null);
    fixture.detectChanges();

    const ratesItem = component
      .navItems()
      .find((item) => item.label === "Tarifas y Reglas");
    expect(ratesItem?.url).toBe(APP_ROUTES.app.parkingLots);

    const slotsItem = component
      .navItems()
      .find((item) => item.label === "Plazas & Bahías");
    expect(slotsItem?.url).toBe(APP_ROUTES.app.parkingLots);
  });

  it("should render live ticket count badge when ticket count > 0", () => {
    fixture.componentRef.setInput("collapsed", false);
    activeTicketsSignal.set([{ id: "t-1" }, { id: "t-2" }, { id: "t-3" }]);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(
      By.css("nav a .text-emerald-500.font-mono")
    );
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain("3");
  });

  it("should calculate active state for different feature routes", async () => {
    // Tickets route
    routerEventsSubject.next(
      new NavigationEnd(1, "/app/tickets", "/app/tickets")
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const ticketsItem = component
      .navItems()
      .find((item) => item.label === "Tickets Emitidos");
    expect(ticketsItem?.isActive).toBe(true);

    // Rates route
    routerEventsSubject.next(
      new NavigationEnd(
        2,
        "/app/parking-lots/p-123/rates",
        "/app/parking-lots/p-123/rates"
      )
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const ratesItem = component
      .navItems()
      .find((item) => item.label === "Tarifas y Reglas");
    expect(ratesItem?.isActive).toBe(true);

    // Slots route
    routerEventsSubject.next(
      new NavigationEnd(
        3,
        "/app/parking-lots/p-123/slots",
        "/app/parking-lots/p-123/slots"
      )
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const slotsItem = component
      .navItems()
      .find((item) => item.label === "Plazas & Bahías");
    expect(slotsItem?.isActive).toBe(true);
  });
});
