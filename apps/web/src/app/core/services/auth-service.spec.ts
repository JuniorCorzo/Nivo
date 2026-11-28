import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthenticationService } from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
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
  let userServiceSpy: {
    clearCurrentUser: ReturnType<typeof vi.fn>;
    loadCurrentUser: ReturnType<typeof vi.fn>;
  };

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
      loadCurrentUser: vi.fn().mockReturnValue(of(null)),
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

  it("should clear previous user, bump sessionGeneration, and load current user on login", () => {
    const initialGen = service.sessionGenerationSignal();
    authControllerSpy.login.mockReturnValue(
      of({ data: { accessToken: "token-a" } })
    );

    let success = false;
    service.login("a@test.com", "secret").subscribe((res) => {
      success = res;
    });

    expect(success).toBe(true);
    expect(service.accessTokenSignal()).toBe("token-a");
    expect(service.sessionGenerationSignal()).toBe(initialGen + 1);
    expect(userServiceSpy.clearCurrentUser).toHaveBeenCalledTimes(1);
    expect(userServiceSpy.loadCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should update token and load user on refreshSession without bumping sessionGeneration", () => {
    const initialGen = service.sessionGenerationSignal();
    authControllerSpy.refreshSession.mockReturnValue(
      of({ data: { accessToken: "refreshed-token" } })
    );

    let token = "";
    service.refreshSession().subscribe((t) => {
      token = t;
    });

    expect(token).toBe("refreshed-token");
    expect(service.accessTokenSignal()).toBe("refreshed-token");
    expect(service.sessionGenerationSignal()).toBe(initialGen);
    expect(userServiceSpy.loadCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should clear accessToken and cached user on logout, bump sessionGeneration, and navigate to login", () => {
    authControllerSpy.login.mockReturnValue(
      of({ data: { accessToken: "token-a" } })
    );
    service.login("a@test.com", "secret").subscribe();
    userServiceSpy.clearCurrentUser.mockClear();
    const genBeforeLogout = service.sessionGenerationSignal();

    service.logout();

    expect(service.accessTokenSignal()).toBeNull();
    expect(service.sessionGenerationSignal()).toBe(genBeforeLogout + 1);
    expect(userServiceSpy.clearCurrentUser).toHaveBeenCalledTimes(1);
    expect(authControllerSpy.logout).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        map: expect.any(Map),
      })
    );
    const [[, logoutContext]] = authControllerSpy.logout.mock.calls;
    expect(logoutContext.get(AUTHORIZED)).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith([APP_ROUTES.auth.login]);
  });

  it("should still clear session and navigate to login when logout request fails", () => {
    authControllerSpy.login.mockReturnValue(
      of({ data: { accessToken: "token-a" } })
    );
    service.login("a@test.com", "secret").subscribe();
    userServiceSpy.clearCurrentUser.mockClear();
    authControllerSpy.logout.mockReturnValue(
      throwError(() => new Error("Network error"))
    );

    service.logout();

    expect(service.accessTokenSignal()).toBeNull();
    expect(userServiceSpy.clearCurrentUser).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith([APP_ROUTES.auth.login]);
  });
});
