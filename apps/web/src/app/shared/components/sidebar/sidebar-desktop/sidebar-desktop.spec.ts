import type { BreakpointState } from "@angular/cdk/layout";
import { BreakpointObserver } from "@angular/cdk/layout";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { UserService } from "@core/services/user/user-service";
import { BehaviorSubject } from "rxjs";
import { vi } from "vitest";

import { SidebarBase } from "../sidebar-base/sidebar-base";
import { SidebarDesktop } from "./sidebar-desktop";

describe("SidebarDesktop", () => {
  let component: SidebarDesktop;
  let fixture: ComponentFixture<SidebarDesktop>;
  let breakpointSubject: BehaviorSubject<BreakpointState>;
  let observeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    breakpointSubject = new BehaviorSubject<BreakpointState>({
      breakpoints: {},
      matches: false,
    });
    observeSpy = vi.fn().mockReturnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [SidebarDesktop],
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
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarDesktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should observe tablet breakpoint query", () => {
    expect(observeSpy).toHaveBeenCalledWith([
      "(min-width: 768px) and (max-width: 1024px)",
    ]);
  });

  it("should render horizontal logo when expanded", () => {
    component.collapsed.set(false);
    fixture.detectChanges();

    /* SAFETY: Fixture nativeElement is HTMLElement */
    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector(
      'ng-icon[name="nivo-logo-horizontal"]'
    );
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeTruthy();
    expect(iconLogo).toBeNull();
  });

  it("should render icon logo when collapsed", () => {
    component.collapsed.set(true);
    fixture.detectChanges();

    /* SAFETY: Fixture nativeElement is HTMLElement */
    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector(
      'ng-icon[name="nivo-logo-horizontal"]'
    );
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeNull();
    expect(iconLogo).toBeTruthy();
  });

  it("should toggle collapsed state when button is clicked", () => {
    component.collapsed.set(false);
    fixture.detectChanges();

    /* SAFETY: QuerySelector returns HTMLButtonElement */
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Colapsar sidebar"]'
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();
    fixture.detectChanges();

    expect(component.collapsed()).toBe(true);

    /* SAFETY: QuerySelector returns HTMLButtonElement */
    const expandButton = fixture.nativeElement.querySelector(
      'button[aria-label="Expandir sidebar"]'
    ) as HTMLButtonElement;
    expect(expandButton).toBeTruthy();
  });

  it("should pass collapsed state to app-sidebar-base", () => {
    component.collapsed.set(true);
    fixture.detectChanges();

    const baseEl = fixture.debugElement.query(By.directive(SidebarBase));
    expect(baseEl).toBeTruthy();
    /* SAFETY: DebugElement componentInstance is SidebarBase */
    const baseInstance = baseEl.componentInstance as SidebarBase;
    expect(baseInstance.collapsed()).toBe(true);
  });
});
