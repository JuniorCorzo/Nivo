import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly registerLink: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.emailInput = page
      .locator("input[placeholder='tu@correo.com']")
      .or(page.getByLabel("Correo"))
      .first();
    this.errorMessage = page.locator("[role='alert']");
    this.forgotPasswordLink = page.getByText("¿Olvidaste la contraseña?");
    this.page = page;
    this.passwordInput = page
      .locator("input[type='password']")
      .or(page.getByLabel("Contraseña"))
      .first();
    this.registerLink = page.getByRole("link", { name: "Regístrate." });
    this.submitButton = page.getByRole("button", { name: "Iniciar sesión" });
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async goto(): Promise<void> {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectErrorMessage(text?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  async expectLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
