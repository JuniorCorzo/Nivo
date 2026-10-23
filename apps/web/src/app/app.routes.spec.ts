import { accountCreationGuard } from "@core/guards/auth/account-creation.guard";
import { authGuard } from "@core/guards/auth/auth-guard";
import { publicGuard } from "@core/guards/auth/public-guard";
import { describe, expect, it } from "vitest";

import { routes } from "./app.routes";

describe("App Routes", () => {
  it("should protect 'app' path with authGuard", () => {
    const appRoute = routes.find((r) => r.path === "app");
    expect(appRoute).toBeDefined();
    expect(appRoute?.canActivate).toBeDefined();
    expect(appRoute?.canActivate).toContain(authGuard);
  });

  it("should configure root '' path with publicGuard and load LandingPageComponent", () => {
    const rootRoute = routes.find((r) => r.path === "");
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.canActivate).toBeDefined();
    expect(rootRoute?.canActivate).toContain(publicGuard);
    expect(rootRoute?.loadComponent).toBeDefined();
  });

  it("should protect 'auth/register' path with accountCreationGuard", () => {
    const authRoute = routes.find((r) => r.path === "auth");
    const registerRoute = authRoute?.children?.find(
      (r) => r.path === "register"
    );
    expect(registerRoute).toBeDefined();
    expect(registerRoute?.canActivate).toContain(accountCreationGuard);
  });
});
