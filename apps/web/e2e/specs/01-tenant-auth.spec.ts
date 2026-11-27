import type { Page } from "@playwright/test";

import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

const setupSessionMocks = async (
  page: Page
): Promise<{ markLoggedIn: () => void }> => {
  let loggedIn = false;
  await page.route(/\/api(?:\/v1)?\/auth\/refresh/u, async (route) => {
    if (!loggedIn) {
      await route.fulfill({
        contentType: "application/json",
        json: { message: "Unauthorized", status: 401 },
        status: 401,
      });
      return;
    }
    await route.fallback();
  });
  await page.route(
    /\/api(?:\/v1)?\/parking-lots(?:\/list)?(?:\?.*)?$/u,
    async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [],
          status: 200,
        },
        status: 200,
      });
    }
  );
  return {
    markLoggedIn: () => {
      loggedIn = true;
    },
  };
};

test.describe("CUJ 01: Tenant Authentication & Session Management", () => {
  test("should display login form controls correctly", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.expectLoaded();
  });

  test("should show error alert on invalid credentials", async ({
    loginPage,
    page,
  }) => {
    await page.route(/\/api(?:\/v1)?\/auth\/login/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          errors: ["Invalid credentials"],
          message: "Correo o contraseña incorrectos",
          status: 401,
        },
        status: 401,
      });
    });

    await loginPage.goto();
    await loginPage.login("wrong@company.com", "InvalidPassword123!");
    await loginPage.expectErrorMessage("Correo o contraseña incorrectos");
  });

  test("should successfully login tenant and redirect to dashboard", async ({
    dashboardPage,
    loginPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);
    const { markLoggedIn } = await setupSessionMocks(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
    markLoggedIn();
    await loginPage.login(tenantA.email, tenantA.password);

    await page.waitForURL(/\/app/u);
    await dashboardPage.expectLoaded();
    await dashboardPage.expectUserEmail(tenantA.email);
  });

  test("should logout tenant and redirect back to login", async ({
    dashboardPage,
    loginPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);
    const { markLoggedIn } = await setupSessionMocks(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
    markLoggedIn();
    await loginPage.login(tenantA.email, tenantA.password);
    await page.waitForURL(/\/app/u);

    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/auth\/login/u);
  });
});
