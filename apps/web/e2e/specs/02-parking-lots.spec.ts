import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

test.describe("CUJ 02: Parking Lots Management", () => {
  const mockParkingLot = {
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
    id: "lot-11111111-1111-1111-1111-111111111111",
    name: "Parqueadero Norte Central",
    occuppationRate: 15,
    operatingHours: {
      closeTime: "22:00",
      openTime: "06:00",
    },
    ownerName: "Admin Tenant A",
    slotDistribution: [
      {
        count: 20,
        prefix: "A",
        type: "CAR",
        zone: "Norte",
      },
    ],
    totalCapacity: 20,
    updatedAt: new Date().toISOString(),
  };

  test("should display empty state when tenant has no parking lots", async ({
    page,
    parkingLotsPage,
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

    await parkingLotsPage.goto();
    await parkingLotsPage.expectEmptyState();
  });

  test("should create a new parking lot via form and redirect to listing", async ({
    page,
    parkingLotsPage,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let createdLot = false;
    await page.route("**/api/v1/parking-lots", async (route) => {
      if (route.request().method() === "POST") {
        createdLot = true;
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: mockParkingLot,
            status: 201,
          },
          status: 201,
        });
        return;
      }

      await route.fulfill({
        contentType: "application/json",
        json: {
          data: createdLot ? [mockParkingLot] : [],
          status: 200,
        },
        status: 200,
      });
    });

    await parkingLotsPage.goto();
    await parkingLotsPage.clickCreateLot();

    await parkingLotsPage.fillForm({
      city: "Bogotá",
      closeTime: "22:00",
      name: "Parqueadero Norte Central",
      openTime: "06:00",
      state: "Cundinamarca",
      street: "Carrera 7 # 123-45",
      zipCode: "110111",
    });

    await parkingLotsPage.submitForm();
    await parkingLotsPage.expectLoaded();
  });

  test("should render active parking lot details and allow deletion", async ({
    page,
    parkingLotsPage,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let deleted = false;
    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: deleted ? [] : [mockParkingLot],
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/parking-lots/${mockParkingLot.id}`,
      async (route) => {
        if (route.request().method() === "DELETE") {
          deleted = true;
          await route.fulfill({
            contentType: "application/json",
            json: {
              status: 204,
            },
            status: 204,
          });
          return;
        }

        await route.fulfill({
          contentType: "application/json",
          json: {
            data: mockParkingLot,
            status: 200,
          },
          status: 200,
        });
      }
    );

    await parkingLotsPage.goto();
    await parkingLotsPage.expectActiveLotName(mockParkingLot.name);

    await parkingLotsPage.deleteActiveLot();
    await expect(page.locator("app-parking-empty-state")).toBeVisible();
  });
});
