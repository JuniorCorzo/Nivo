import { OverlayContainer } from "@angular/cdk/overlay";
import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { UserModel } from "@core/models/user.model";
import { AuthService } from "@core/services/auth-service";
import { UserService } from "@core/services/user/user-service";

import { UserMenu } from "./user-menu";

describe("UserMenu", () => {
  let component: UserMenu;
  let fixture: ComponentFixture<UserMenu>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const mockUser: UserModel = {
    contactInfo: "+1234567890",
    createdAt: new Date(),
    email: "john@example.com",
    fullName: "John Doe",
    id: "1",
    role: "OWNER",
    tenant: {
      companyName: "Tenant 1",
      id: "t-1",
    },
    updatedAt: new Date(),
  };

  const currentUserSignal = signal<UserModel | null>(mockUser);

  const mockUserService = {
    currentUser: currentUserSignal,
  };

  const mockAuthService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    currentUserSignal.set(mockUser);

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

  it("should not display 'Invitado' when user is null or has no name", async () => {
    currentUserSignal.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('[role="button"]');
    expect(trigger?.textContent).not.toContain("Invitado");
    expect(trigger?.getAttribute("title") ?? "").not.toContain("Invitado");

    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = overlayContainerElement.querySelector('[role="menu"]');
    expect(menu?.textContent).not.toContain("Invitado");
  });
});
