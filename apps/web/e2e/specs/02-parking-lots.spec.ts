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

    await parkingLotsPage.goto();
    await parkingLotsPage.expectEmptyState();
    await expect(
      page
        .locator("app-parking-empty-state, [data-testid='empty-state']")
        .first()
    ).toBeVisible();
  });

  test("should create a new parking lot via form and redirect to listing", async ({
    page,
    parkingLotsPage,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let createdLot = false;
    let createPayload:
      | { address?: { city?: string; state?: string }; name?: string }
      | undefined;
    await page.route(
      /\/api(?:\/v1)?\/parking-lots\/create$/u,
      async (route) => {
        createPayload = route.request().postDataJSON() as {
          address?: { city?: string; state?: string };
          name?: string;
        };
        createdLot = true;
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: mockParkingLot,
            status: 201,
          },
          status: 201,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/parking-lots(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: createdLot ? [mockParkingLot] : [],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/parking-lots\/[^/]+\/telemetry(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { data: null, status: 200 },
          status: 200,
        });
      }
    );

    await parkingLotsPage.goto();
    await parkingLotsPage.clickCreateLot();

    await parkingLotsPage.fillForm({
      city: "Soacha",
      closeTime: "22:00",
      name: "Parqueadero Norte Central",
      openTime: "06:00",
      state: "Cundinamarca",
      street: "Carrera 7 # 123-45",
      zipCode: "110111",
    });

    await parkingLotsPage.submitForm();
    await parkingLotsPage.expectLoaded();
    expect(createPayload).toMatchObject({
      address: {
        city: "Soacha",
        state: "Cundinamarca",
      },
      name: "Parqueadero Norte Central",
    });
    await parkingLotsPage.expectActiveLotName(mockParkingLot.name);
  });

  test("should render active parking lot details, switch tabs and navigate to edit", async ({
    page,
    parkingLotsPage,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    await page.route(
      /\/api(?:\/v1)?\/parking-lots(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [mockParkingLot],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/parking-lots\/[^/]+\/telemetry(?:\?.*)?$/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { data: null, status: 200 },
          status: 200,
        });
      }
    );

    await parkingLotsPage.goto();
    await parkingLotsPage.expectActiveLotName(mockParkingLot.name);

    await page.getByRole("tab", { name: /Sede, Mapa & Políticas/iu }).click();
    await expect(page.locator("app-parking-general-info")).toBeVisible();
    await expect(
      page.locator("app-parking-general-info").getByText("Carrera 7 # 123-45")
    ).toBeVisible();

    await parkingLotsPage.editButton.click();
    await expect(page).toHaveURL(
      new RegExp(`/app/parking-lots/${mockParkingLot.id}/edit`, "u")
    );
  });
});
