import { authGuard } from "@core/guards/auth/auth-guard";
import { describe, expect, it } from "vitest";

import { routes } from "./app.routes";

describe("App Routes", () => {
  it("should protect 'app' path with authGuard", () => {
    const appRoute = routes.find((r) => r.path === "app");
    expect(appRoute).toBeDefined();
    expect(appRoute?.canActivate).toBeDefined();
    expect(appRoute?.canActivate).toContain(authGuard);
  });
});
