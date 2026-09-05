import type { WritableSignal } from "@angular/core";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { UserService } from "@core/services/user/user-service";

import { Sidebar } from "./sidebar";

interface SidebarInternal {
  collapsed: WritableSignal<boolean>;
}

describe("Sidebar", () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render horizontal logo when expanded", async () => {
    /* SAFETY: Accessing protected member collapsed in unit test */
    const internal = component as Sidebar & SidebarInternal;
    internal.collapsed.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    /* SAFETY: Fixture nativeElement is HTMLElement */
    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector(
      'ng-icon[name="nivo-logo-horizontal"]'
    );
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeTruthy();
    expect(iconLogo).toBeNull();
  });

  it("should render icon logo when collapsed", async () => {
    /* SAFETY: Accessing protected member collapsed in unit test */
    const internal = component as Sidebar & SidebarInternal;
    internal.collapsed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    /* SAFETY: Fixture nativeElement is HTMLElement */
    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector(
      'ng-icon[name="nivo-logo-horizontal"]'
    );
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeNull();
    expect(iconLogo).toBeTruthy();
  });

  it("should toggle collapsed state when toggle button is clicked", async () => {
    /* SAFETY: Accessing protected member collapsed in unit test */
    const internal = component as Sidebar & SidebarInternal;
    internal.collapsed.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    /* SAFETY: querySelector returns HTMLButtonElement */
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Colapsar sidebar"]'
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(internal.collapsed()).toBeTrue();
    /* SAFETY: querySelector returns HTMLButtonElement */
    const expandButton = fixture.nativeElement.querySelector(
      'button[aria-label="Expandir sidebar"]'
    ) as HTMLButtonElement;
    expect(expandButton).toBeTruthy();
  });
});
