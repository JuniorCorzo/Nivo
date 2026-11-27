import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export interface CheckInFormData {
  email?: string;
  plate: string;
  rateId?: string;
  slotId?: string;
}

export class CheckInPage {
  readonly cancelCheckInButton: Locator;
  readonly cancelCheckOutButton: Locator;
  readonly checkInModal: Locator;
  readonly checkOutModal: Locator;
  readonly checkoutSubmitButton: Locator;
  readonly closeReceiptButton: Locator;
  readonly emailInput: Locator;
  readonly headerTitle: Locator;
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
    this.checkInModal = page.locator(
      "app-check-in-modal .animate-modal-backdrop"
    );
    this.checkOutModal = page.locator("app-check-out-modal");
    this.checkoutSubmitButton = page
      .locator("app-check-out-modal app-payment-step")
      .getByRole("button", {
        name: /Cobrar y Registrar Salida|Autorizar Salida Gratuita/iu,
      });
    this.closeReceiptButton = page
      .locator("app-ticket-receipt .animate-modal-backdrop")
      .getByRole("button", { name: /Cerrar/iu })
      .first();
    this.emailInput = page.locator(
      "input#delivery-email-input, input#email-input"
    );
    this.headerTitle = page
      .locator("app-page-header")
      .getByText("Operaciones de Parqueo")
      .first();
    this.page = page;
    this.plateInput = page.locator("input#plate-input");
    this.rateSelect = page.locator("select#rate-select");
    this.receiptModal = page.locator(
      "app-ticket-receipt .animate-modal-backdrop"
    );
    this.slotSelect = page.locator("select#slot-select");
    this.submitCheckInButton = page
      .locator("app-check-in-modal")
      .getByRole("button", { name: /Emitir Ticket|Confirmar Ingreso/iu });
  }

  async closeReceipt(): Promise<void> {
    if (await this.receiptModal.isVisible()) {
      await this.closeReceiptButton.click();
      await expect(this.receiptModal).toBeHidden();
    }
  }

  async confirmCheckOut(): Promise<void> {
    const continueButton = this.checkOutModal
      .locator("app-settlement-step")
      .getByRole("button", {
        name: /Continuar al Pago|Autorizar Salida Gratuita/iu,
      });
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    await expect(this.checkoutSubmitButton).toBeVisible();
    await this.checkoutSubmitButton.click();
  }

  async fillCheckIn(data: CheckInFormData): Promise<void> {
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
    await expect(this.page.locator("app-operations-omnibar")).toBeVisible();
    await this.page.keyboard.press("i");
    await expect(this.checkInModal).toBeVisible();
  }

  async openCheckOutModal(): Promise<void> {
    await expect(this.page.locator("app-operations-omnibar")).toBeVisible();
    await this.page.keyboard.press("o");
    await expect(
      this.checkOutModal.getByRole("heading", { name: /Procesar Salida/iu })
    ).toBeVisible();
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
