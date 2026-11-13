import { expect, setupMockTenantApi, test } from "../fixtures/auth.fixture";

test.describe("CUJ 05: Operations Cockpit, Omnibar & Multichannel Delivery", () => {
  const parkingId = "lot-55555555-5555-5555-5555-555555555555";
  const slotAvailableId = "slot-avail-5555-5555-555555555555";
  const slotOccupiedId = "slot-occup-5555-5555-555555555555";
  const rateCarId = "rate-car-5555-5555-555555555555";
  const activeTicketId = "ticket-active-5555-5555-555555555555";

  const mockParkingLot = {
    address: {
      city: "Bogotá",
      country: "Colombia",
      state: "Cundinamarca",
      street: "Carrera 15 # 93-60",
      zipCode: "110221",
    },
    coordinates: { latitude: 4.678, longitude: -74.057 },
    createdAt: new Date().toISOString(),
    currency: "COP",
    id: parkingId,
    name: "Nivo Cockpit Central",
    occuppationRate: 50,
    operatingHours: { closeTime: "23:00", openTime: "06:00" },
    ownerName: "Admin Tenant A",
    slotDistribution: [
      { count: 1, prefix: "A", type: "CAR", zone: "P1" },
      { count: 1, prefix: "B", type: "CAR", zone: "P1" },
    ],
    totalCapacity: 2,
    updatedAt: new Date().toISOString(),
  };

  const mockRates = [
    {
      description: "Tarifa estándar carros",
      id: rateCarId,
      name: "Tarifa Carro Estándar",
      pricePerUnit: 4500,
      timeUnit: "HOURS",
      vehicleType: "CAR",
    },
  ];

  const mockSlots = [
    {
      hasHistory: false,
      hasTicket: false,
      id: slotAvailableId,
      numberSlot: "101",
      parking: { id: parkingId, name: "Nivo Cockpit Central" },
      parkingName: "Nivo Cockpit Central",
      prefix: "A",
      status: "AVAILABLE",
      type: "CAR",
      zone: "P1",
    },
    {
      hasHistory: false,
      hasTicket: true,
      id: slotOccupiedId,
      numberSlot: "102",
      parking: { id: parkingId, name: "Nivo Cockpit Central" },
      parkingName: "Nivo Cockpit Central",
      prefix: "B",
      status: "OCCUPIED",
      type: "CAR",
      zone: "P1",
    },
  ];

  const mockActiveTicket = {
    createdAt: new Date().toISOString(),
    entryTime: new Date(Date.now() - 3600000).toISOString(),
    id: activeTicketId,
    licensePlate: "XYZ789",
    rate: {
      id: rateCarId,
      name: "Tarifa Carro Estándar",
      pricePerUnit: 4500,
      timeUnit: "HOURS",
    },
    slot: {
      id: slotOccupiedId,
      number: "102",
      prefix: "B",
      zone: "P1",
    },
    status: "OPEN",
    user: {
      email: "admin@tenanta.com",
      fullName: "Admin Tenant A",
      id: "user-tenant-a-uuid",
    },
  };

  test.beforeEach(async ({ page, tenantA }) => {
    await setupMockTenantApi(page, tenantA);

    await page.route(`**/api/v1/parking-lots/${parkingId}`, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: mockParkingLot, status: 200 },
        status: 200,
      });
    });

    await page.route(
      `**/api/v1/slots/summary?parking=${parkingId}`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { data: mockSlots, status: 200 },
          status: 200,
        });
      }
    );

    await page.route(
      `**/api/v1/parking-lots/${parkingId}/rates`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { data: mockRates, status: 200 },
          status: 200,
        });
      }
    );

    await page.route(
      `**/api/v1/tickets?parking=${parkingId}`,
      async (route) => {
        await route.fulfill({
          contentType: "application/json",
          json: { data: [mockActiveTicket], status: 200 },
          status: 200,
        });
      }
    );
  });

  test("should perform express check-in via Omnibar with formatted plate and digital WhatsApp channel", async ({
    page,
  }) => {
    let capturedPayload: unknown = null;

    await page.route("**/api/v1/tickets", async (route) => {
      if (route.request().method() === "POST") {
        capturedPayload = route.request().postDataJSON();
        await route.fulfill({
          contentType: "application/json",
          json: {
            data: {
              ...mockActiveTicket,
              id: "ticket-new-created",
              licensePlate: "ABC123",
              phoneNumber: "3119876543",
            },
            status: 201,
          },
          status: 201,
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto(`/app/parking-lots/${parkingId}/operations`);
    await expect(page.locator("app-operations-omnibar")).toBeVisible();

    // 1. Enter plate in omnibar and trigger express check-in
    const omnibarPlate = page.locator("#express-plate-input");
    await omnibarPlate.fill("abc123");
    await page.locator("app-operations-omnibar button:has-text('Ingresar')").click();

    // 2. Modal opens with read-only validation display
    const modal = page.locator("app-check-in-modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator("#plate-display")).toContainText("ABC-123");
    await expect(modal.locator("span:has-text('CO')")).toBeVisible();

    // 3. Select WhatsApp channel and enter phone number
    const deliveryCard = modal.locator("app-ticket-delivery-card");
    await expect(deliveryCard).toBeVisible();
    const phoneInput = deliveryCard.locator("#delivery-phone-input");
    await phoneInput.fill("3119876543");

    // 4. Submit Check-in and inspect API payload
    await modal.getByRole("button", { name: /Emitir Ticket|Confirmar Ingreso/iu }).click();

    await expect.poll(() => capturedPayload).not.toBeNull();
    expect(capturedPayload).toMatchObject({
      phoneNumber: "3119876543",
      plate: "ABC-123",
      plateCountry: "CO",
    });
    expect((capturedPayload as { email?: string })?.email).toBeUndefined();

    // 5. Verify receipt modal opens and contains WhatsApp share button with link
    const receiptModal = page.locator("app-ticket-receipt");
    await expect(receiptModal).toBeVisible();
    const whatsappLink = receiptModal.locator("a:has-text('Enviar por WhatsApp')");
    await expect(whatsappLink).toBeVisible();
    const href = await whatsappLink.getAttribute("href");
    expect(href).toContain("573119876543");
    expect(href).toContain("ABC-123");

    // Close receipt
    await receiptModal.getByRole("button", { name: /Cerrar/iu }).click();
    await expect(receiptModal).toBeHidden();
  });

  test("should trigger modal shortcuts I, O and protect hotkeys during input focus", async ({
    page,
  }) => {
    await page.goto(`/app/parking-lots/${parkingId}/operations`);
    await expect(page.locator("app-operations-omnibar")).toBeVisible();

    // 1. Press 'I' without input focus -> opens CheckIn modal
    await page.keyboard.press("i");
    const checkInModal = page.locator("app-check-in-modal");
    await expect(checkInModal).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(checkInModal).toBeHidden();

    // 2. Press 'O' without input focus -> opens CheckOut modal
    await page.keyboard.press("o");
    const checkOutModal = page.locator("app-check-out-modal");
    await expect(checkOutModal).toBeVisible();

    // Close checkout modal
    const closeBtn = checkOutModal.getByRole("button", { name: /Cancelar|Cerrar/iu }).first();
    await closeBtn.click();
    await expect(checkOutModal).toBeHidden();

    // 3. Typing 'i' inside the search input must NOT open check-in modal
    const searchInput = page.locator("#search-ticket-checkout");
    await searchInput.focus();
    await page.keyboard.type("i");

    await expect(checkInModal).toBeHidden();
    expect(await searchInput.inputValue()).toBe("I");
  });

  test("should interact with tactical slots grid to pre-select available slot or initiate checkout", async ({
    page,
  }) => {
    await page.goto(`/app/parking-lots/${parkingId}/operations`);
    await expect(page.locator("app-operations-slots-grid")).toBeVisible();

    // 1. Click on AVAILABLE slot A-101
    const availableSlotCard = page.locator(
      'app-operations-slots-grid [role="button"][aria-label*="A-101 disponible"]'
    );
    await expect(availableSlotCard).toBeVisible();
    await availableSlotCard.click();

    // Check-in modal opens with preselected slot banner
    const checkInModal = page.locator("app-check-in-modal");
    await expect(checkInModal).toBeVisible();
    await expect(checkInModal.locator("text=Bahía Asignada: A-101 (CAR)")).toBeVisible();

    // Close check-in modal
    await checkInModal.getByRole("button", { name: "Cancelar" }).click();
    await expect(checkInModal).toBeHidden();

    // 2. Click on OCCUPIED slot B-102
    const occupiedSlotCard = page.locator(
      'app-operations-slots-grid [role="button"][aria-label*="B-102 ocupada"]'
    );
    await expect(occupiedSlotCard).toBeVisible();
    await occupiedSlotCard.click();

    // Check-out modal opens for the active ticket
    const checkOutModal = page.locator("app-check-out-modal");
    await expect(checkOutModal).toBeVisible();
  });

  test("should inspect ticket in detail drawer, verify mailto target and trigger reprint", async ({
    page,
  }) => {
    await page.goto(`/app/parking-lots/${parkingId}/operations`);
    await expect(page.locator("app-operations-active-tickets-table")).toBeVisible();

    // 1. Click on active ticket row in table to open drawer
    const ticketRow = page.locator("app-operations-active-tickets-table tr:has-text('XYZ789')");
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    const drawer = page.locator("app-ticket-detail-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator("text=XYZ789")).toBeVisible();

    // 2. Inspect Ticket Delivery Card in drawer
    const drawerDelivery = drawer.locator("app-ticket-delivery-card");
    await expect(drawerDelivery).toBeVisible();

    // Switch to Email channel
    await drawerDelivery.getByRole("button", { name: /Correo/iu }).click();
    const emailInput = drawerDelivery.locator("#delivery-email-input");
    await emailInput.fill("conductor@ejemplo.com");

    const emailButton = drawerDelivery.locator("a:has-text('Enviar por Correo')");
    await expect(emailButton).toBeVisible();

    // Verify email link does not have target="_blank"
    const targetAttr = await emailButton.getAttribute("target");
    expect(targetAttr).toBeNull();
    const hrefAttr = await emailButton.getAttribute("href");
    expect(hrefAttr).toContain("mailto:conductor@ejemplo.com");

    // 3. Click reprint button in drawer -> opens ticket receipt modal
    const reprintBtn = drawer.locator("nv-button[title*='Reimprimir'], button:has-text('Reimprimir')").first();
    await reprintBtn.click();

    const receiptModal = page.locator("app-ticket-receipt");
    await expect(receiptModal).toBeVisible();
    await expect(receiptModal.locator("text=XYZ789")).toBeVisible();
  });
});
