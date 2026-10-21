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
});
