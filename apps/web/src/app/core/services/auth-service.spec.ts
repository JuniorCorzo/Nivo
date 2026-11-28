import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthenticationService } from "@core/api/generated/services";
import { UserService } from "@core/services/user/user-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { of, throwError } from "rxjs";

import { AuthService } from "./auth-service";

describe("AuthService", () => {
  let service: AuthService;
  let authControllerSpy: {
    login: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let userServiceSpy: { clearCurrentUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authControllerSpy = {
      login: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
      refreshSession: vi.fn(),
    };
    routerSpy = {
      navigate: vi.fn(),
    };
    userServiceSpy = {
      clearCurrentUser: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthenticationService, useValue: authControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it("should clear accessToken and cached user on logout and navigate to login", () => {
    authControllerSpy.login.mockReturnValue(
      of({ data: { accessToken: "token-a" } })
    );
    service.login("a@test.com", "secret").subscribe();
    expect(service.accessTokenSignal()).toBe("token-a");

    service.logout();

    expect(service.accessTokenSignal()).toBeNull();
    expect(userServiceSpy.clearCurrentUser).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith([APP_ROUTES.auth.login]);
  });

  it("should still clear session and navigate to login when logout request fails", () => {
    authControllerSpy.login.mockReturnValue(
      of({ data: { accessToken: "token-a" } })
    );
    service.login("a@test.com", "secret").subscribe();
    authControllerSpy.logout.mockReturnValue(
      throwError(() => new Error("Network error"))
    );

    service.logout();

    expect(service.accessTokenSignal()).toBeNull();
    expect(userServiceSpy.clearCurrentUser).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith([APP_ROUTES.auth.login]);
  });
});
