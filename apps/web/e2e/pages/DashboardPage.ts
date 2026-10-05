import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class DashboardPage {
  readonly brandLogo: Locator;
  readonly logoutButton: Locator;
  readonly page: Page;
  readonly parkingLotsLink: Locator;
  readonly sidebar: Locator;
  readonly ticketsLink: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.brandLogo = page.locator("aside a[aria-label='Nivo']");
    this.logoutButton = page.locator("app-logout-button button");
    this.page = page;
    this.parkingLotsLink = page.getByRole("link", { name: "Parqueaderos" });
    this.sidebar = page.locator("aside.sidebar");
    this.ticketsLink = page.getByRole("link", { name: "Tickets" });
    this.userMenu = page.locator("app-user-menu");
  }

  async goto(): Promise<void> {
    await this.page.goto("/app/parking-lots");
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  async navigateToParkingLots(): Promise<void> {
    await this.parkingLotsLink.click();
  }

  async navigateToTickets(): Promise<void> {
    await this.ticketsLink.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.sidebar).toBeVisible();
    await expect(this.brandLogo).toBeVisible();
  }

  async expectUserEmail(email: string): Promise<void> {
    await expect(this.userMenu).toContainText(email);
  }

  async expectUserName(name: string): Promise<void> {
    await expect(this.userMenu).toContainText(name);
  }
}
