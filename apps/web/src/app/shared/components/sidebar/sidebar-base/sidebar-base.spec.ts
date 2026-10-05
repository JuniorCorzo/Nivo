import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NavigationEnd, Router, provideRouter } from "@angular/router";
import { UserService } from "@core/services/user/user-service";
import { SidebarFooter } from "@shared/components/sidebar-footer/sidebar-footer";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { Subject } from "rxjs";

import { SidebarBase } from "./sidebar-base";

describe("SidebarBase", () => {
  let component: SidebarBase;
  let fixture: ComponentFixture<SidebarBase>;
  let routerEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<unknown>();

    await TestBed.configureTestingModule({
      imports: [SidebarBase],
      providers: [
        provideRouter([]),
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
});
