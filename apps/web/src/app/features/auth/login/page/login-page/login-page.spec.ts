import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { RedirectService } from "@core/services/redirect/redirect-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginPage } from "./login-page";

describe("LoginPage", () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let router: Router;

  const mockAuthService = {
    login: vi.fn(),
  };

  const mockRedirectService = {
    getRedirectUrl: vi.fn().mockReturnValue(""),
    hasRedirectUrl: vi.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: RedirectService, useValue: mockRedirectService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, "navigate").mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate to parking lots when login succeeds", () => {
    mockAuthService.login.mockReturnValue(of(true));

    component.onSubmit(new Event("submit"));

    expect(router.navigate).toHaveBeenCalledWith([APP_ROUTES.app.parkingLots]);
    expect(component["invalidCredentials"]()).toBe(false);
    expect(component["isLoading"]()).toBe(false);
  });

  it("should navigate to redirect URL when redirectService has redirect URL on successful login", () => {
    mockAuthService.login.mockReturnValue(of(true));
    mockRedirectService.hasRedirectUrl.mockReturnValue(true);
    mockRedirectService.getRedirectUrl.mockReturnValue("/custom-redirect");

    component.onSubmit(new Event("submit"));

    expect(router.navigate).toHaveBeenCalledWith(["/custom-redirect"]);
    expect(component["invalidCredentials"]()).toBe(false);
    expect(component["isLoading"]()).toBe(false);
  });

  it("should not navigate and should set invalidCredentials to true when login fails", () => {
    mockAuthService.login.mockReturnValue(of(false));

    component.onSubmit(new Event("submit"));

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component["invalidCredentials"]()).toBe(true);
    expect(component["isLoading"]()).toBe(false);
  });
});
