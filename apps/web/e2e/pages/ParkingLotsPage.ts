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
    this.cancelFormButton = page.locator(
      "[data-testid='parking-form-header-cancel'] button"
    );
    this.cityInput = page.locator("nv-combobox#city input, input#city").first();
    this.closeTimeInput = page.locator(
      "input#closeTime, input[placeholder*='20:00']"
    );
    this.editButton = page.getByRole("button", {
      name: /Editar Sede|Editar/iu,
    });
    this.emptyCreateButton = page
      .locator("app-parking-empty-state")
      .getByRole("button");
    this.emptyState = page.locator("app-parking-empty-state");
    this.nameInput = page.locator("nv-input#name input, input#name").first();
    this.openTimeInput = page.locator(
      "input#openTime, input[placeholder*='08:00']"
    );
    this.operationsButton = page
      .getByRole("button", {
        name: /Ir a Taquilla Directa|Operaciones en vivo/iu,
      })
      .first();
    this.page = page;
    this.ratesButton = page
      .getByRole("button", { name: /Configurar Tarifas|Tarifas/iu })
      .first();
    this.slotsButton = page
      .getByRole("button", { name: /Auditar Bahías|Espacios \/ Slots/iu })
      .first();
    this.stateInput = page
      .locator("nv-combobox#state input, input#state")
      .first();
    this.streetInput = page
      .locator("nv-input#street input, input#street")
      .first();
    this.submitFormButton = page.locator(
      "[data-testid='parking-form-header-submit'] button"
    );
    this.zipCodeInput = page
      .locator("nv-input#zipCode input, input#zipCode")
      .first();
  }

  async clickCreateLot(): Promise<void> {
    const lotSelector = this.page
      .locator("app-parking-lot-selector button")
      .first();
    await this.emptyState.or(lotSelector).first().waitFor({ state: "visible" });

    if (await this.emptyState.isVisible()) {
      await this.emptyCreateButton.click();
      return;
    }

    await lotSelector.click();
    const newLotButton = this.page.getByRole("button", {
      name: "+ Nueva sede",
    });
    await expect(newLotButton).toBeVisible();
    await newLotButton.click();
  }

  async fillForm(data: ParkingLotFormData): Promise<void> {
    await this.nameInput.fill(data.name);

    if (data.street) {
      await this.streetInput.fill(data.street);
    }

    if (data.state) {
      await this.stateInput.click();
      await this.stateInput.fill(data.state);
      const stateOption = this.page
        .locator('[role="option"]')
        .filter({ hasText: data.state })
        .first();
      await expect(stateOption).toBeVisible();
      await stateOption.click();
    }

    if (data.city) {
      await expect(this.cityInput).toBeEnabled();
      await this.cityInput.click();
      await this.cityInput.fill(data.city);
      const cityOption = this.page
        .locator('[role="option"]')
        .filter({ hasText: data.city })
        .first();
      await expect(cityOption).toBeVisible();
      await cityOption.click();
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
    await expect(this.page).toHaveURL(/\/app\/parking-lots\/?$/u);
  }
}
