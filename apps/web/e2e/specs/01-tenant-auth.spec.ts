import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

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
    await page.route("**/api/v1/auth/login", async (route) => {
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
    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [],
          status: 200,
        },
        status: 200,
      });
    });

    await loginPage.goto();
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
    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [],
          status: 200,
        },
        status: 200,
      });
    });

    await loginPage.goto();
    await loginPage.login(tenantA.email, tenantA.password);
    await page.waitForURL(/\/app/u);

    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/auth\/login/u);
  });
});
