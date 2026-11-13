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
      createdAt: "",
      description: "Tarifa estándar carros",
      id: rateCarId,
      minChargeTimeMinutes: 0,
      name: "Tarifa Carro Estándar",
      parkingId,
      pricePerUnit: 4500,
      timeUnit: "HOURS",
      updatedAt: "",
      vehicleType: "CAR",
    },
  ];

  const mockSlots = [
    {
      hasCharger: false,
      hasHistory: false,
      hasTicket: false,
      id: slotAvailableId,
      isAccessible: false,
      isActive: true,
      numberSlot: "101",
      parking: { id: parkingId, name: "Nivo Cockpit Central" },
      parkingName: "Nivo Cockpit Central",
      prefix: "A",
      slotNumber: "101",
      status: "AVAILABLE",
      type: "CAR",
      zone: "P1",
    },
    {
      hasCharger: false,
      hasHistory: false,
      hasTicket: true,
      id: slotOccupiedId,
      isAccessible: false,
      isActive: true,
      numberSlot: "102",
      parking: { id: parkingId, name: "Nivo Cockpit Central" },
      parkingName: "Nivo Cockpit Central",
      prefix: "B",
      slotNumber: "102",
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
    parkingId,
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
      slotNumber: "102",
      zone: "P1",
    },
    slotId: slotOccupiedId,
    slotNumber: "102",
    status: "OPEN",
    user: {
      email: "admin@tenanta.com",
      fullName: "Admin Tenant A",
      id: "user-tenant-a-uuid",
    },
  };

  test.beforeEach(async ({ page, tenantA }) => {
    await setupMockTenantApi(page, tenantA);

    await page.route(/\/api(\/v1)?\/parking-lots(\/list)?(\?.*)?$/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: [mockParkingLot], status: 200 },
        status: 200,
      });
    });

    await page.route(new RegExp(`/api(/v1)?/parking-lots/${parkingId}`, "u"), async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: mockParkingLot, status: 200 },
        status: 200,
      });
    });

    await page.route(/\/api(\/v1)?\/slots(\/list)?\/summary/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: mockSlots, status: 200 },
        status: 200,
      });
    });

    await page.route(new RegExp(`/api(/v1)?/parking-lots/${parkingId}/rates`, "u"), async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: mockRates, status: 200 },
        status: 200,
      });
    });

    await page.route(/\/api(\/v1)?\/tickets\/active/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: { data: mockActiveTicket, status: 200 },
        status: 200,
      });
    });

    await page.route(/\/api(\/v1)?\/rates\/.*\/calculate/u, async (route) => {
      await route.fulfill({
        contentType: "application/json",
        json: {
          data: {
            breakpoint: [],
            ivaAmount: 0,
            ivaRate: 0,
            name: "Tarifa Carro Estándar",
            subtotal: 4500,
            total: 4500,
          },
          status: 200,
        },
        status: 200,
      });
    });

    await page.route(/\/api(\/v1)?\/tickets(\/list)?(\?.*)?$/u, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          contentType: "application/json",
          json: { data: [mockActiveTicket], status: 200 },
          status: 200,
        });
      } else {
        await route.fallback();
      }
    });
  });

  test("should perform express check-in via Omnibar with formatted plate and digital WhatsApp channel", async ({
    page,
  }) => {
    let capturedPayload: unknown = null;

    await page.route(/\/api(\/v1)?\/tickets(\/check-in)?$/u, async (route) => {
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
    const modalBackdrop = page.locator("app-check-in-modal .animate-modal-backdrop");
    await expect(modalBackdrop).toBeVisible();
    await expect(modalBackdrop.locator("#plate-display")).toContainText("ABC-123");
    await expect(modalBackdrop.getByText("CO", { exact: true })).toBeVisible();

    // 3. Select WhatsApp channel tab and enter phone number
    const deliveryCard = modalBackdrop.locator("app-ticket-delivery-card");
    await expect(deliveryCard).toBeVisible();
    await deliveryCard.getByRole("button", { name: /WhatsApp/iu }).first().click();
    const phoneInput = deliveryCard.locator("#delivery-phone-input");
    await phoneInput.fill("3119876543");

    // 4. Submit Check-in and inspect API payload
    await modalBackdrop.getByRole("button", { name: /Emitir Ticket|Confirmar Ingreso/iu }).click();

    await expect.poll(() => capturedPayload).not.toBeNull();
    expect(capturedPayload).toMatchObject({
      phoneNumber: "3119876543",
      plate: "ABC-123",
      plateCountry: "CO",
    });
    expect((capturedPayload as { email?: string })?.email).toBeUndefined();

    // 5. Verify receipt modal opens and contains WhatsApp share button with link
    const receiptBackdrop = page.locator("app-ticket-receipt .animate-modal-backdrop");
    await expect(receiptBackdrop).toBeVisible();
    const whatsappLink = receiptBackdrop.locator("a:has-text('Enviar por WhatsApp')");
    await expect(whatsappLink).toBeVisible();
    const href = await whatsappLink.getAttribute("href");
    expect(href).toContain("573119876543");
    expect(href).toContain("ABC123");

    // Close receipt
    await receiptBackdrop.getByRole("button", { name: /Cerrar/iu }).first().click();
    await expect(receiptBackdrop).toBeHidden();
  });

  test("should trigger modal shortcuts I, O and protect hotkeys during input focus", async ({
    page,
  }) => {
    await page.goto(`/app/parking-lots/${parkingId}/operations`);
    await expect(page.locator("app-operations-omnibar")).toBeVisible();

    // 1. Press 'I' without input focus -> opens CheckIn modal
    await page.keyboard.press("i");
    const checkInModalBackdrop = page.locator("app-check-in-modal .animate-modal-backdrop");
    await expect(checkInModalBackdrop).toBeVisible();

    // Close via Cancel button
    const cancelBtn = checkInModalBackdrop.getByRole("button", { name: "Cancelar" });
    await cancelBtn.click();
    await expect(checkInModalBackdrop).toBeHidden();

    // 2. Press 'O' without input focus -> opens CheckOut modal
    await page.keyboard.press("o");
    const checkOutModalContent = page.locator("app-check-out-modal .fixed.inset-0");
    await expect(checkOutModalContent).toBeVisible();

    // Close checkout modal
    const closeBtn = checkOutModalContent.getByRole("button", { name: /Cancelar|Cerrar/iu }).first();
    await closeBtn.click();
    await expect(checkOutModalContent).toBeHidden();

    // 3. Typing 'i' inside the search input must NOT open check-in modal
    const searchInput = page.locator("#search-ticket-checkout");
    await searchInput.focus();
    await page.keyboard.type("i");

    await expect(checkInModalBackdrop).toBeHidden();
    expect((await searchInput.inputValue()).toUpperCase()).toBe("I");
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
    const checkInModalBackdrop = page.locator("app-check-in-modal .animate-modal-backdrop");
    await expect(checkInModalBackdrop).toBeVisible();
    await expect(checkInModalBackdrop.locator("text=Bahía Asignada: A-101 (CAR)")).toBeVisible();

    // Close check-in modal
    await checkInModalBackdrop.getByRole("button", { name: "Cancelar" }).click();
    await expect(checkInModalBackdrop).toBeHidden();

    // 2. Click on OCCUPIED slot B-102
    const occupiedSlotCard = page.locator(
      'app-operations-slots-grid [role="button"][aria-label*="B-102 ocupada"]'
    );
    await expect(occupiedSlotCard).toBeVisible();
    await occupiedSlotCard.click();

    // Check-out modal opens for the active ticket
    const checkOutModalContent = page.locator("app-check-out-modal .fixed.inset-0");
    await expect(checkOutModalContent).toBeVisible();
  });

  test("should inspect ticket in detail drawer, verify mailto target and trigger reprint", async ({
    page,
  }) => {
    await page.goto("/app/tickets");
    await expect(page.locator("app-tickets-table")).toBeVisible();

    // 1. Click on active ticket row in table to open drawer
    const ticketRow = page.locator("app-tickets-table tr:has-text('XYZ789')");
    await expect(ticketRow).toBeVisible();
    await ticketRow.click();

    const drawerAside = page.locator("app-ticket-detail-drawer aside");
    await expect(drawerAside).toBeVisible();
    await expect(drawerAside.locator("text=XYZ789")).toBeVisible();

    // 2. Inspect Ticket Delivery Card in drawer
    const drawerDelivery = drawerAside.locator("app-ticket-delivery-card");
    await expect(drawerDelivery).toBeVisible();

    // Switch to Email channel
    await drawerDelivery.getByRole("button", { name: /Correo/iu }).first().click();
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
    const reprintBtn = drawerAside.locator("nv-button[title*='Reimprimir'], button:has-text('Reimprimir')").first();
    await reprintBtn.click();

    const receiptBackdrop = page.locator("app-ticket-receipt .animate-modal-backdrop");
    await expect(receiptBackdrop).toBeVisible();
    await expect(receiptBackdrop.locator("text=XYZ-789")).toBeVisible();
  });
});
