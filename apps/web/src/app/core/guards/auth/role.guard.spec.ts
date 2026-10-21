import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { firstValueFrom, map, of, timer } from "rxjs";
import type { Observable } from "rxjs";
import { roleGuard } from "./role.guard";

describe("roleGuard", () => {
  let router: Router;
  let currentUserSignal = signal<UserModel | null>(null);

  /* SAFETY: Minimal mock satisfying ActivatedRouteSnapshot for route guard test */
  const mockRoute = {} as ActivatedRouteSnapshot;
  /* SAFETY: Minimal mock satisfying RouterStateSnapshot for route guard test */
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    currentUserSignal = signal<UserModel | null>(null);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: currentUserSignal,
            loadCurrentUser: vi.fn(() => of(currentUserSignal())),
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn((commands: unknown[]) => ({
              toString: () => commands.join("/"),
            })),
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it("should allow access if user has allowed role", async () => {
    currentUserSignal.set({
      contactInfo: "",
      createdAt: new Date(),
      email: "test@test.com",
      fullName: "Admin User",
      id: "1",
      role: "MANAGER",
      tenant: { companyName: "Co", id: "t1" },
      updatedAt: new Date(),
    });

    const guard = roleGuard(["MANAGER", "OWNER"]);
    /* SAFETY: roleGuard returns Observable<boolean | UrlTree> */
    const result$ = TestBed.runInInjectionContext(() => guard(mockRoute, mockState)) as Observable<
      boolean | UrlTree
    >;
    const result = await firstValueFrom(result$);

    expect(result).toBe(true);
  });

  it("should redirect to parkingLots if user does not have allowed role", async () => {
    currentUserSignal.set({
      contactInfo: "",
      createdAt: new Date(),
      email: "op@test.com",
      fullName: "Operator User",
      id: "2",
      role: "OPERATOR",
      tenant: { companyName: "Co", id: "t1" },
      updatedAt: new Date(),
    });

    const guard = roleGuard(["MANAGER", "OWNER"]);
    /* SAFETY: roleGuard returns Observable<boolean | UrlTree> */
    const result$ = TestBed.runInInjectionContext(() => guard(mockRoute, mockState)) as Observable<
      boolean | UrlTree
    >;
    const result = await firstValueFrom(result$);

    expect(router.createUrlTree).toHaveBeenCalledWith([APP_ROUTES.app.parkingLots]);
    expect(result).not.toBe(true);
  });

  it("should redirect to login if user is not logged in (null)", async () => {
    currentUserSignal.set(null);

    const guard = roleGuard(["MANAGER", "OWNER"]);
    /* SAFETY: roleGuard returns Observable<boolean | UrlTree> */
    const result$ = TestBed.runInInjectionContext(() => guard(mockRoute, mockState)) as Observable<
      boolean | UrlTree
    >;
    const result = await firstValueFrom(result$);

    expect(router.createUrlTree).toHaveBeenCalledWith([APP_ROUTES.auth.login]);
    expect(result).not.toBe(true);
  });

  it("should wait for asynchronous loadCurrentUser to resolve and allow access if role matches", async () => {
    const delayedUser: UserModel = {
      contactInfo: "",
      createdAt: new Date(),
      email: "async@test.com",
      fullName: "Async Manager",
      id: "3",
      role: "MANAGER",
      tenant: { companyName: "Co", id: "t1" },
      updatedAt: new Date(),
    };

    const userServiceMock = TestBed.inject(UserService);
    vi.mocked(userServiceMock.loadCurrentUser).mockReturnValue(
      timer(20).pipe(map(() => delayedUser)),
    );

    const guard = roleGuard(["MANAGER"]);
    /* SAFETY: roleGuard returns Observable<boolean | UrlTree> */
    const result$ = TestBed.runInInjectionContext(() => guard(mockRoute, mockState)) as Observable<
      boolean | UrlTree
    >;
    const result = await firstValueFrom(result$);

    expect(result).toBe(true);
  });
});
