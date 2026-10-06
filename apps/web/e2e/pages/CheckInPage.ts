import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export interface CheckInFormData {
  email?: string;
  plate: string;
  rateId?: string;
  slotId?: string;
  vehicleType?: "CAR" | "MOTORCYCLE";
}

export class CheckInPage {
  readonly cancelCheckInButton: Locator;
  readonly cancelCheckOutButton: Locator;
  readonly carVehicleButton: Locator;
  readonly checkInModal: Locator;
  readonly checkOutModal: Locator;
  readonly checkoutSubmitButton: Locator;
  readonly closeReceiptButton: Locator;
  readonly emailInput: Locator;
  readonly headerTitle: Locator;
  readonly motorcycleVehicleButton: Locator;
  readonly openCheckInButton: Locator;
  readonly openCheckOutButton: Locator;
  readonly page: Page;
  readonly plateInput: Locator;
  readonly rateSelect: Locator;
  readonly receiptModal: Locator;
  readonly slotSelect: Locator;
  readonly submitCheckInButton: Locator;

  constructor(page: Page) {
    this.cancelCheckInButton = page
      .locator("app-check-in-modal")
      .getByRole("button", { name: "Cancelar" });
    this.cancelCheckOutButton = page
      .locator("app-check-out-modal")
      .getByRole("button", { name: /Cancelar|Cerrar/iu });
    this.carVehicleButton = page
      .locator("app-check-in-modal button")
      .filter({ hasText: "Automóvil" });
    this.checkInModal = page.locator("app-check-in-modal");
    this.checkOutModal = page.locator("app-check-out-modal");
    this.checkoutSubmitButton = page
      .locator("app-check-out-modal")
      .getByRole("button", {
        name: /Cobrar y Registrar Salida|Autorizar Salida Gratuita/iu,
      });
    this.closeReceiptButton = page
      .locator("app-ticket-receipt")
      .getByRole("button", { name: /Cerrar/iu });
    this.emailInput = page.locator("input#email-input");
    this.headerTitle = page.getByRole("heading", {
      name: "Operaciones de Parqueo",
    });
    this.motorcycleVehicleButton = page
      .locator("app-check-in-modal button")
      .filter({ hasText: "Motocicleta" });
    this.openCheckInButton = page.getByRole("button", {
      name: "Registrar Ingreso",
    });
    this.openCheckOutButton = page.getByRole("button", {
      name: "Procesar Salida",
    });
    this.page = page;
    this.plateInput = page.locator("input#plate-input");
    this.rateSelect = page.locator("select#rate-select");
    this.receiptModal = page.locator("app-ticket-receipt");
    this.slotSelect = page.locator("select#slot-select");
    this.submitCheckInButton = page
      .locator("app-check-in-modal")
      .getByRole("button", { name: "Emitir Ticket" });
  }

  async closeReceipt(): Promise<void> {
    if (await this.receiptModal.isVisible()) {
      await this.closeReceiptButton.click();
      await expect(this.receiptModal).toBeHidden();
    }
  }

  async confirmCheckOut(): Promise<void> {
    await expect(this.checkoutSubmitButton).toBeVisible();
    await this.checkoutSubmitButton.click();
  }

  async fillCheckIn(data: CheckInFormData): Promise<void> {
    if (data.vehicleType === "MOTORCYCLE") {
      await this.motorcycleVehicleButton.click();
    } else if (data.vehicleType === "CAR") {
      await this.carVehicleButton.click();
    }

    await this.plateInput.fill(data.plate);

    if (data.slotId) {
      await this.slotSelect.selectOption(data.slotId);
    }

    if (data.rateId) {
      await this.rateSelect.selectOption(data.rateId);
    }

    if (data.email) {
      await this.emailInput.fill(data.email);
    }
  }

  async goto(parkingId: string): Promise<void> {
    await this.page.goto(`/app/parking-lots/${parkingId}/operations`);
  }

  async openCheckInModal(): Promise<void> {
    await this.openCheckInButton.click();
    await expect(this.checkInModal).toBeVisible();
  }

  async openCheckOutModal(): Promise<void> {
    await this.openCheckOutButton.click();
    await expect(this.checkOutModal).toBeVisible();
  }

  async selectSlotForCheckout(slotPrefixOrNumber?: string): Promise<void> {
    if (slotPrefixOrNumber) {
      const targetSlot = this.checkOutModal
        .locator("button")
        .filter({ hasText: slotPrefixOrNumber });
      await targetSlot.click();
    } else {
      const firstOccupied = this.checkOutModal
        .locator("button")
        .filter({ hasText: "Procesar" })
        .first();
      await firstOccupied.click();
    }
  }

  async submitCheckIn(): Promise<void> {
    await this.submitCheckInButton.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.headerTitle).toBeVisible();
  }

  async expectReceiptOpen(): Promise<void> {
    await expect(this.receiptModal).toBeVisible();
  }
}
