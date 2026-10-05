import { OverlayContainer } from "@angular/cdk/overlay";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { UserService } from "@core/services/user/user-service";

import { UserMenu } from "./user-menu";

describe("UserMenu", () => {
  let component: UserMenu;
  let fixture: ComponentFixture<UserMenu>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const mockUser = {
    email: "john@example.com",
    fullName: "John Doe",
    id: "1",
    role: "admin",
  };

  const mockUserService = {
    currentUser: signal(mockUser),
  };

  const mockAuthService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenu],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture = TestBed.createComponent(UserMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have accessibility attributes on the trigger (role='button', aria-haspopup='menu', aria-expanded)", () => {
    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("should open popover when clicking the trigger", async () => {
    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = overlayContainerElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
  });

  it("should contain user details, theme button and logout button inside popover", async () => {
    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = overlayContainerElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(menu?.textContent).toContain("John Doe");
    expect(menu?.textContent).toContain("john@example.com");

    const themeButton =
      overlayContainerElement.querySelector("app-theme-button");
    expect(themeButton).toBeTruthy();

    const logoutButton =
      overlayContainerElement.querySelector("app-logout-button");
    expect(logoutButton).toBeTruthy();
  });

  it("should close popover when pressing Escape", async () => {
    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeFalsy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("should close popover when clicking outside or calling close()", async () => {
    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeTruthy();

    component.close();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeFalsy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
