import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from "@angular/router";
import { UrlTree } from "@angular/router";
import { FeatureFlagService } from "@core/services/feature-flag.service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { accountCreationGuard } from "./account-creation.guard";

const executeGuard: CanActivateFn = (...guardParameters) =>
  TestBed.runInInjectionContext(() => accountCreationGuard(...guardParameters));

describe("accountCreationGuard", () => {
  const accountCreationEnabledMock = signal(false);

  beforeEach(() => {
    accountCreationEnabledMock.set(false);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: FeatureFlagService,
          useValue: {
            accountCreationEnabled: accountCreationEnabledMock.asReadonly(),
          },
        },
      ],
    });
  });

  it("should allow activation when accountCreationEnabled is true", () => {
    accountCreationEnabledMock.set(true);

    /* SAFETY: Guard ignores route snapshots in test context */
    const mockRoute = {} as ActivatedRouteSnapshot;
    /* SAFETY: Guard ignores router state in test context */
    const mockState = {} as RouterStateSnapshot;

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBe(true);
  });

  it("should redirect to login when accountCreationEnabled is false", () => {
    accountCreationEnabledMock.set(false);

    /* SAFETY: Guard ignores route snapshots in test context */
    const mockRoute = {} as ActivatedRouteSnapshot;
    /* SAFETY: Guard ignores router state in test context */
    const mockState = {} as RouterStateSnapshot;

    const result = executeGuard(mockRoute, mockState);

    expect(result instanceof UrlTree).toBe(true);
    /* SAFETY: Invariant verified by previous instanceof check */
    const tree = result as UrlTree;
    expect(tree.toString()).toBe(APP_ROUTES.auth.login);
  });
});
