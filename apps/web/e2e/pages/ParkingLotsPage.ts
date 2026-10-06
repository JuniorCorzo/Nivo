import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export interface ParkingLotFormData {
  closeTime?: string;
  city?: string;
  name: string;
  openTime?: string;
  state?: string;
  street?: string;
  zipCode?: string;
}

export class ParkingLotsPage {
  readonly activeLotTitle: Locator;
  readonly cancelFormButton: Locator;
  readonly cityInput: Locator;
  readonly closeTimeInput: Locator;
  readonly confirmDeleteButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly emptyCreateButton: Locator;
  readonly emptyState: Locator;
  readonly nameInput: Locator;
  readonly openTimeInput: Locator;
  readonly operationsButton: Locator;
  readonly page: Page;
  readonly ratesButton: Locator;
  readonly slotsButton: Locator;
  readonly stateInput: Locator;
  readonly streetInput: Locator;
  readonly submitFormButton: Locator;
  readonly zipCodeInput: Locator;

  constructor(page: Page) {
    this.activeLotTitle = page.locator("app-parking-lot-selector");
    this.cancelFormButton = page
      .locator("app-parking-form")
      .getByRole("button", { name: "Cancelar" });
    this.cityInput = page.locator("input#city");
    this.closeTimeInput = page.locator(
      "input#closeTime, input[placeholder='Ej. 20:00']"
    );
    this.confirmDeleteButton = page
      .locator("app-delete-parking-modal")
      .getByRole("button", { name: "Sí, eliminar" });
    this.deleteButton = page.getByRole("button", { name: "Eliminar" });
    this.editButton = page.getByRole("button", { name: "Editar" });
    this.emptyCreateButton = page
      .locator("app-parking-empty-state")
      .getByRole("button");
    this.emptyState = page.locator("app-parking-empty-state");
    this.nameInput = page.locator("input#name");
    this.openTimeInput = page.locator(
      "input#openTime, input[placeholder='Ej. 08:00']"
    );
    this.operationsButton = page.getByRole("button", {
      name: "Operaciones en vivo",
    });
    this.page = page;
    this.ratesButton = page.getByRole("button", { name: "Tarifas" });
    this.slotsButton = page.getByRole("button", { name: "Espacios / Slots" });
    this.stateInput = page.locator("input#state");
    this.streetInput = page.locator("input#street");
    this.submitFormButton = page
      .locator("app-parking-form")
      .getByRole("button", {
        name: /Guardar cambios|Crear Parqueadero|Guardando/iu,
      });
    this.zipCodeInput = page.locator("input#zipCode");
  }

  async clickCreateLot(): Promise<void> {
    const emptyCount = await this.emptyState.count();
    if (emptyCount > 0 && (await this.emptyState.isVisible())) {
      await this.emptyCreateButton.click();
      return;
    }

    const lotSelector = this.page
      .locator("app-parking-lot-selector button")
      .first();
    if (await lotSelector.isVisible()) {
      await lotSelector.click();
      const newLotButton = this.page.getByRole("button", {
        name: "+ Nueva sede",
      });
      if (await newLotButton.isVisible()) {
        await newLotButton.click();
        return;
      }
    }

    await this.page.goto("/app/parking-lots/create");
  }

  async deleteActiveLot(): Promise<void> {
    await this.deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
    await this.confirmDeleteButton.click();
  }

  async fillForm(data: ParkingLotFormData): Promise<void> {
    await this.nameInput.fill(data.name);

    if (data.street) {
      await this.streetInput.fill(data.street);
    }

    if (data.state) {
      await this.stateInput.fill(data.state);
      await this.stateInput.press("Enter");
    }

    if (data.city) {
      await this.cityInput.fill(data.city);
      await this.cityInput.press("Enter");
    }

    if (data.zipCode) {
      await this.zipCodeInput.fill(data.zipCode);
    }

    if (data.openTime) {
      await this.openTimeInput.fill(data.openTime);
    }

    if (data.closeTime) {
      await this.closeTimeInput.fill(data.closeTime);
    }
  }

  async goToOperations(): Promise<void> {
    await this.operationsButton.click();
  }

  async goto(): Promise<void> {
    await this.page.goto("/app/parking-lots");
  }

  async submitForm(): Promise<void> {
    await this.submitFormButton.click();
  }

  async expectActiveLotName(name: string): Promise<void> {
    await expect(this.activeLotTitle).toContainText(name);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/app\/parking-lots/u);
  }
}
