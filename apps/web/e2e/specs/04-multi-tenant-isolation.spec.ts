import type { Route } from "@playwright/test";

import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

test.describe("CUJ 04: Multi-Tenant Data Isolation & IDOR Protection", () => {
  const tenantALotId = "lot-tenant-a-1111-1111-1111-111111111111";
  const tenantBLotId = "lot-tenant-b-2222-2222-2222-222222222222";

  const tenantALot = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Carrera 7 # 123-45",
      zipCode: "110111",
    },
    coordinates: {
      latitude: 4.6097,
      longitude: -74.0817,
    },
    createdAt: new Date().toISOString(),
    currency: "COP",
    id: tenantALotId,
    name: "Tenant A Centro",
    occuppationRate: 10,
    ownerName: "Admin Tenant A",
    slotDistribution: [],
    totalCapacity: 20,
    updatedAt: new Date().toISOString(),
  };

  const tenantBLot = {
    address: {
      city: "Medellín",
      country: "Colombia",
      state: "Antioquia",
      street: "Calle 10 # 43-20",
      zipCode: "050021",
    },
    coordinates: {
      latitude: 6.2442,
      longitude: -75.5812,
    },
    createdAt: new Date().toISOString(),
    currency: "COP",
    id: tenantBLotId,
    name: "Tenant B Poblado",
    occuppationRate: 80,
    ownerName: "Admin Tenant B",
    slotDistribution: [],
    totalCapacity: 100,
    updatedAt: new Date().toISOString(),
  };

  test("Tenant A cannot view Tenant B's parking lot and gets 404 Not Found error", async ({
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    await page.route(
      /\/api(?:\/v1)?\/parking-lots(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [tenantALot],
            status: 200,
          },
          status: 200,
        });
      }
    );

    const notFoundHandler = async (route: Route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          errors: ["Parking lot not found or belongs to another tenant"],
          message: "Parqueadero no encontrado",
          status: 404,
        },
        status: 404,
      });
    };

    await page.route(
      new RegExp(`/api(?:/v1)?/parking-lots/${tenantBLotId}/rates$`, "u"),
      notFoundHandler
    );
    await page.route(
      /\/api(?:\/v1)?\/slots(?:\/list)?\/summary/u,
      notFoundHandler
    );
    await page.route(
      /\/api(?:\/v1)?\/tickets(?:\/list)?(?:\?.*)?$/u,
      notFoundHandler
    );

    await page.goto(`/app/parking-lots/${tenantBLotId}/operations`);

    const toast = page.locator("nv-toast, [role='alert']").first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Parqueadero no encontrado");
    await expect(page.getByText("Tenant B Poblado")).toBeHidden();
  });

  test("Tenant B session only lists Tenant B's resources and never leaks Tenant A data", async ({
    dashboardPage,
    page,
    tenantB,
  }) => {
    await setupMockTenantApi(page, tenantB);

    await page.route(
      /\/api(?:\/v1)?\/parking-lots(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [tenantBLot],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.goto("/app/parking-lots");
    await dashboardPage.expectUserEmail(tenantB.email);

    await expect(page.getByText("Tenant B Poblado").first()).toBeVisible();
    await expect(page.getByText("Tenant A Centro")).toBeHidden();
  });
});
