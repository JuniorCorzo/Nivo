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
    timeUnit: "HOUR",
    vehicleType: "CAR",
  };

  const getMockSlot = (status: "AVAILABLE" | "OCCUPIED") => ({
    hasHistory: false,
    hasTicket: status === "OCCUPIED",
    id: slotId,
    numberSlot: "101",
    parking: {
      id: parkingId,
      name: "Parqueadero Central Operaciones",
    },
    parkingName: "Parqueadero Central Operaciones",
    prefix: "A",
    status,
    type: "CAR",
    zone: "Norte",
  });

  const mockTicket = {
    createdAt: new Date().toISOString(),
    entryTime: new Date().toISOString(),
    id: ticketId,
    licensePlate: "ABC123",
    rate: {
      id: rateId,
      name: "Tarifa Carro Estándar",
      pricePerUnit: 5000,
      timeUnit: "HOUR",
    },
    slot: {
      id: slotId,
      number: "101",
      prefix: "A",
      zone: "Norte",
    },
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

    await page.route("**/api/v1/parking-lots", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: [mockParkingLot],
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(`**/api/v1/parking-lots/${parkingId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: mockParkingLot,
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/slots/summary?parking=${parkingId}`,
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
      `**/api/v1/parking-lots/${parkingId}/rates`,
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
      `**/api/v1/tickets?parking=${parkingId}`,
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
    await expect(page.getByText("Cupos Disponibles")).toBeVisible();
    await expect(page.getByText("A-101")).toBeVisible();
  });

  test("should register vehicle check-in and issue parking receipt", async ({
    checkInPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let isOccupied = false;

    await page.route(`**/api/v1/parking-lots/${parkingId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: mockParkingLot,
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/slots/summary?parking=${parkingId}`,
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
      `**/api/v1/parking-lots/${parkingId}/rates`,
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
      `**/api/v1/tickets?parking=${parkingId}`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: isOccupied ? [mockTicket] : [],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route("**/api/v1/tickets", async (route) => {
      isOccupied = true;
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: mockTicket,
          status: 201,
        },
        status: 201,
      });
    });

    await checkInPage.goto(parkingId);
    await checkInPage.openCheckInModal();

    await checkInPage.fillCheckIn({
      plate: "ABC123",
      vehicleType: "CAR",
    });

    await checkInPage.submitCheckIn();
    await checkInPage.expectReceiptOpen();
    await checkInPage.closeReceipt();
  });

  test("should process vehicle check-out and free slot back to available", async ({
    checkInPage,
    page,
    tenantA,
  }) => {
    await setupMockTenantApi(page, tenantA);

    let isCheckedOut = false;

    await page.route(`**/api/v1/parking-lots/${parkingId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: mockParkingLot,
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/slots/summary?parking=${parkingId}`,
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
      `**/api/v1/parking-lots/${parkingId}/rates`,
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
      `**/api/v1/tickets?parking=${parkingId}`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: isCheckedOut ? [] : [mockTicket],
            status: 200,
          },
          status: 200,
        });
      }
    );

    await page.route(
      `**/api/v1/tickets/${ticketId}/calculate-fee`,
      async (route) => {
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
      }
    );

    await page.route("**/api/v1/tickets/checkout", async (route) => {
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
    await checkInPage.confirmCheckOut();
    await checkInPage.expectReceiptOpen();
    await checkInPage.closeReceipt();
  });
});
