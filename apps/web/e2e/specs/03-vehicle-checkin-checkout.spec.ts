import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

test.describe("CUJ 03: Vehicle Operations Check-In & Check-Out", () => {
  const parkingId = "lot-11111111-1111-1111-1111-111111111111";
  const slotId = "slot-11111111-1111-1111-1111-111111111111";
  const rateId = "rate-11111111-1111-1111-1111-111111111111";
  const ticketId = "ticket-11111111-1111-1111-1111-111111111111";

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
    id: parkingId,
    name: "Parqueadero Central Operaciones",
    occuppationRate: 0,
    operatingHours: {
      closeTime: "22:00",
      openTime: "06:00",
    },
    ownerName: "Admin Tenant A",
    slotDistribution: [
      {
        count: 1,
        prefix: "A",
        type: "CAR",
        zone: "Norte",
      },
    ],
    totalCapacity: 1,
    updatedAt: new Date().toISOString(),
  };

  const mockRate = {
    description: "Tarifa estándar para automóviles",
    id: rateId,
    name: "Tarifa Carro Estándar",
    pricePerUnit: 5000,
    timeUnit: "HOURS",
    vehicleType: "CAR",
  };

  const getMockSlot = (status: "AVAILABLE" | "OCCUPIED") => ({
    hasCharger: false,
    hasHistory: false,
    hasTicket: status === "OCCUPIED",
    id: slotId,
    isAccessible: false,
    isActive: true,
    numberSlot: "101",
    parking: {
      id: parkingId,
      name: "Parqueadero Central Operaciones",
    },
    parkingName: "Parqueadero Central Operaciones",
    prefix: "A",
    slotNumber: "101",
    status,
    type: "CAR",
    zone: "Norte",
  });

  const mockTicket = {
    createdAt: new Date().toISOString(),
    entryTime: new Date().toISOString(),
    id: ticketId,
    licensePlate: "ABC123",
    parkingId,
    rate: {
      id: rateId,
      name: "Tarifa Carro Estándar",
      pricePerUnit: 5000,
      timeUnit: "HOURS",
    },
    slot: {
      id: slotId,
      number: "101",
      prefix: "A",
      slotNumber: "101",
      zone: "Norte",
    },
    slotId,
    slotNumber: "101",
    status: "OPEN",
    user: {
      email: "admin@tenanta.com",
      fullName: "Admin Tenant A",
      id: "user-tenant-a-uuid",
    },
  };

  test("should render operations page with live summary cards and slots visualizer", async ({
    checkInPage,
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
            data: [mockParkingLot],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}$`, "u"),
      async (route) => {
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

    await page.route(
      /\/api(?:\/v1)?\/slots(?:\/list)?\/summary/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [getMockSlot("AVAILABLE")],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}/rates$`, "u"),
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [mockRate],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/tickets(?:\/list)?(?:\?.*)?$/u,
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

    await checkInPage.goto(parkingId);
    await checkInPage.expectLoaded();
    await expect(page.getByText("Capacidad Global")).toBeVisible();
    await expect(page.getByText("A-101")).toBeVisible();
  });

  test("should register vehicle check-in and issue parking receipt", async ({
    checkInPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let isOccupied = false;
    let checkInPayload: { plate?: string; slotId?: string } | undefined;

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
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}$`, "u"),
      async (route) => {
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

    await page.route(
      /\/api(?:\/v1)?\/slots(?:\/list)?\/summary/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [getMockSlot(isOccupied ? "OCCUPIED" : "AVAILABLE")],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}/rates$`, "u"),
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [mockRate],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/tickets(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            contentType: "application/json",
            json: {
              data: isOccupied ? [mockTicket] : [],
              status: 200,
            },
            status: 200,
          });
          return;
        }
        await route.fallback();
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/tickets(?:\/check-in)?$/u,
      async (route) => {
        if (route.request().method() === "POST") {
          checkInPayload = route.request().postDataJSON() as {
            plate?: string;
            slotId?: string;
          };
          isOccupied = true;
          await route.fulfill({
            contentType: "application/json",
            json: {
              data: mockTicket,
              status: 201,
            },
            status: 201,
          });
          return;
        }
        await route.fallback();
      }
    );

    await checkInPage.goto(parkingId);
    await checkInPage.openCheckInModal();

    await checkInPage.fillCheckIn({
      plate: "ABC123",
    });

    await checkInPage.submitCheckIn();
    await checkInPage.expectReceiptOpen();
    expect(checkInPayload).toMatchObject({
      plate: "ABC-123",
      slotId,
    });
    await expect(checkInPage.receiptModal).toContainText("ABC-123");
    await checkInPage.closeReceipt();
    await expect(
      page.getByRole("button", { name: /Bahía A-101 ocupada/iu })
    ).toBeVisible();
  });

  test("should process vehicle check-out and free slot back to available", async ({
    checkInPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let isCheckedOut = false;

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
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}$`, "u"),
      async (route) => {
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

    await page.route(
      /\/api(?:\/v1)?\/slots(?:\/list)?\/summary/u,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [getMockSlot(isCheckedOut ? "AVAILABLE" : "OCCUPIED")],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      new RegExp(`/api(?:/v1)?/parking-lots/${parkingId}/rates$`, "u"),
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: [mockRate],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      /\/api(?:\/v1)?\/tickets(?:\/list)?(?:\?.*)?$/u,
      async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            contentType: "application/json",
            json: {
              data: isCheckedOut ? [] : [mockTicket],
              status: 200,
            },
            status: 200,
          });
          return;
        }
        await route.fallback();
      }
    );

    await page.route(/\/api(?:\/v1)?\/tickets\/active/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: mockTicket,
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(/\/api(?:\/v1)?\/rates\/.*\/calculate/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: {
            breakpoint: [
              {
                amount: 5000,
                concept: "1 Hora de estancia",
              },
            ],
            ivaAmount: 950,
            ivaRate: 19,
            name: "Tarifa Carro Estándar",
            subtotal: 5000,
            total: 5950,
          },
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(/\/api(?:\/v1)?\/tickets\/check-out/u, async (route) => {
      isCheckedOut = true;
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: {
            amount: 5950,
            id: "pay-11111111-1111-1111-1111-111111111111",
            paymentDate: new Date().toISOString(),
            paymentMethod: "EFFECTIVE",
            status: "PAID",
          },
          status: 200,
        },
        status: 200,
      });
    });

    await checkInPage.goto(parkingId);
    await checkInPage.openCheckOutModal();
    await checkInPage.selectSlotForCheckout("101");
    await expect(checkInPage.checkOutModal).toContainText(/5[.,]?950/u);
    await checkInPage.confirmCheckOut();
    await checkInPage.expectReceiptOpen();
    await expect(checkInPage.receiptModal).toContainText("ABC-123");
    await checkInPage.closeReceipt();
    await expect(
      page.getByRole("button", { name: /Bahía A-101 disponible/iu })
    ).toBeVisible();
  });
});
