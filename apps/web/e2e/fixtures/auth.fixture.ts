import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";

import { CheckInPage } from "../pages/CheckInPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { ParkingLotsPage } from "../pages/ParkingLotsPage";

export { expect } from "@playwright/test";

export interface TenantProfile {
  email: string;
  fullName: string;
  id: string;
  tenantId: string;
}

export interface TenantCredentials {
  email: string;
  name: string;
  password: string;
  profile: TenantProfile;
  tenantId: string;
}

export const TENANT_A: TenantCredentials = {
  email: "admin@tenanta.com",
  name: "Tenant A Parking",
  password: "Password123!",
  profile: {
    email: "admin@tenanta.com",
    fullName: "Admin Tenant A",
    id: "user-tenant-a-uuid",
    tenantId: "11111111-1111-1111-1111-111111111111",
  },
  tenantId: "11111111-1111-1111-1111-111111111111",
};

export const TENANT_B: TenantCredentials = {
  email: "admin@tenantb.com",
  name: "Tenant B Parking",
  password: "Password123!",
  profile: {
    email: "admin@tenantb.com",
    fullName: "Admin Tenant B",
    id: "user-tenant-b-uuid",
    tenantId: "22222222-2222-2222-2222-222222222222",
  },
  tenantId: "22222222-2222-2222-2222-222222222222",
};

export const setupMockTenantApi = async (
  page: Page,
  tenant: TenantCredentials
): Promise<void> => {
  await page.route("**/api/v1/auth/login", async (route) => {
    /* SAFETY: postDataJSON parses request body into an object with email and password */
    const postData = route.request().postDataJSON() as {
      email?: string;
      password?: string;
    } | null;
    const isValid =
      postData?.email === tenant.email && postData.password === tenant.password;

    await route.fulfill(
      isValid
        ? {
            contentType: "application/json",
            json: {
              data: {
                accessToken: `mock-jwt-token-${tenant.tenantId}`,
                refreshToken: `mock-refresh-token-${tenant.tenantId}`,
              },
              status: 200,
            },
            status: 200,
          }
        : {
            contentType: "application/json",
            json: {
              errors: ["Invalid credentials"],
              message: "Credenciales inválidas",
              status: 401,
            },
            status: 401,
          }
    );
  });

  await page.route("**/api/v1/auth/refresh", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        data: {
          accessToken: `mock-jwt-token-${tenant.tenantId}`,
        },
        status: 200,
      },
      status: 200,
    });
  });

  await page.route("**/api/v1/users/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        data: tenant.profile,
        status: 200,
      },
      status: 200,
    });
  });

  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        message: "Logged out",
        status: 200,
      },
      status: 200,
    });
  });
};

interface TestFixtures {
  authenticatedTenantPage: Page;
  checkInPage: CheckInPage;
  dashboardPage: DashboardPage;
  loginPage: LoginPage;
  parkingLotsPage: ParkingLotsPage;
  tenantA: TenantCredentials;
  tenantB: TenantCredentials;
}

export const test = base.extend<TestFixtures>({
  authenticatedTenantPage: async ({ page }, use) => {
    await setupMockTenantApi(page, TENANT_A);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TENANT_A.email, TENANT_A.password);
    await page.waitForURL(/\/app/u);
    await use(page);
  },
  checkInPage: async ({ page }, use) => {
    await use(new CheckInPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  parkingLotsPage: async ({ page }, use) => {
    await use(new ParkingLotsPage(page));
  },
  tenantA: async ({ playwright }, use) => {
    void playwright;
    await use(TENANT_A);
  },
  tenantB: async ({ playwright }, use) => {
    void playwright;
    await use(TENANT_B);
  },
});
