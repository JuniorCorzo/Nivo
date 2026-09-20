import type { BreakpointState } from "@angular/cdk/layout";
import { BreakpointObserver } from "@angular/cdk/layout";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { UserService } from "@core/services/user/user-service";
import { BehaviorSubject } from "rxjs";
import { vi } from "vitest";

import { SidebarDesktop } from "../sidebar-desktop/sidebar-desktop";
import { SidebarMobile } from "../sidebar-mobile/sidebar-mobile";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let breakpointSubject: BehaviorSubject<BreakpointState>;
  let observeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    breakpointSubject = new BehaviorSubject<BreakpointState>({
      breakpoints: {},
      matches: false,
    });
    observeSpy = vi.fn().mockReturnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        {
          provide: BreakpointObserver,
          useValue: {
            isMatched: () => breakpointSubject.value.matches,
            observe: observeSpy,
          },
        },
        {
          provide: ActiveParkingService,
          useValue: {
            activeParkingLot: signal(null),
            activeParkingName: signal(""),
            hasActiveParking: signal(false),
          },
        },
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should observe mobile breakpoint query", () => {
    expect(observeSpy).toHaveBeenCalledWith(["(max-width: 767.98px)"]);
  });

  it("should render desktop sidebar when not in mobile view", () => {
    breakpointSubject.next({ breakpoints: {}, matches: false });
    fixture.detectChanges();

    const desktopEl = fixture.debugElement.query(By.directive(SidebarDesktop));
    const mobileEl = fixture.debugElement.query(By.directive(SidebarMobile));

    expect(desktopEl).toBeTruthy();
    expect(mobileEl).toBeNull();
  });

  it("should render mobile sidebar when in mobile view", () => {
    breakpointSubject.next({ breakpoints: {}, matches: true });
    fixture.detectChanges();

    const desktopEl = fixture.debugElement.query(By.directive(SidebarDesktop));
    const mobileEl = fixture.debugElement.query(By.directive(SidebarMobile));

    expect(desktopEl).toBeNull();
    expect(mobileEl).toBeTruthy();
  });
});
