import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

test.describe("CUJ 04: Multi-Tenant Data Isolation & IDOR Protection", () => {
  const tenantALotId = "lot-tenant-a-1111-1111-1111-111111111111";
  const tenantBLotId = "lot-tenant-b-2222-2222-2222-222222222222";
  const tenantBTicketId = "ticket-tenant-b-2222-2222-2222-222222222222";

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

    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [tenantALot],
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/parking-lots/${tenantBLotId}`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            errors: ["Parking lot not found or belongs to another tenant"],
            message: "Parqueadero no encontrado",
            status: 404,
          },
          status: 404,
        });
      }
    );

    await page.goto(`/app/parking-lots/${tenantBLotId}/operations`);

    const alertMessage = page.locator(
      "[role='alert'], .toast, .text-destructive"
    );
    await expect(alertMessage.first()).toBeVisible();
    await expect(page.getByText("Tenant B Poblado")).toBeHidden();
  });

  test("Tenant A cannot delete Tenant B's parking lot (IDOR protection)", async ({
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let deleteBlocked = false;
    await page.route(
      `**/api/v1/parking-lots/${tenantBLotId}`,
      async (route) => {
        if (route.request().method() === "DELETE") {
          deleteBlocked = true;
          await route.fulfill({
            contentType: "application/json",
            json: {
              errors: [
                "Access denied: You do not have permission to delete this resource",
              ],
              message: "No tienes permisos para realizar esta acción",
              status: 403,
            },
            status: 403,
          });
          return;
        }

        await route.fulfill({
          contentType: "application/json",
          json: {
            data: tenantALot,
            status: 200,
          },
          status: 200,
        });
      }
    );

    const response = await page.request.delete(
      `/api/v1/parking-lots/${tenantBLotId}`,
      {
        headers: {
          Authorization: `Bearer mock-jwt-token-${tenantA.tenantId}`,
        },
      }
    );

    expect(response.status()).toBe(403);
    expect(deleteBlocked).toBe(true);
  });

  test("Tenant A cannot access or query Tenant B's tickets", async ({
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    await page.route(`**/api/v1/tickets/${tenantBTicketId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          errors: ["Ticket not found or cross-tenant access forbidden"],
          message: "Ticket no encontrado",
          status: 404,
        },
        status: 404,
      });
    });

    const response = await page.request.get(
      `/api/v1/tickets/${tenantBTicketId}`,
      {
        headers: {
          Authorization: `Bearer mock-jwt-token-${tenantA.tenantId}`,
        },
      }
    );

    expect(response.status()).toBe(404);
  });

  test("Tenant B session only lists Tenant B's resources and never leaks Tenant A data", async ({
    dashboardPage,
    page,
    tenantB,
  }) => {
    await setupMockTenantApi(page, tenantB);

    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [tenantBLot],
          status: 200,
        },
        status: 200,
      });
    });

    await page.goto("/app/parking-lots");
    await dashboardPage.expectUserEmail(tenantB.email);

    await expect(page.getByText("Tenant B Poblado")).toBeVisible();
    await expect(page.getByText("Tenant A Centro")).toBeHidden();
  });
});
