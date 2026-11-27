import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env["CI"]),
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
        },
      },
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env["CI"] ? 2 : 0,
  testDir: "./e2e/specs",
  use: {
    baseURL: process.env["E2E_BASE_URL"] || "http://127.0.0.1:4200",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec ng serve --host 127.0.0.1 --port 4200",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    url: "http://127.0.0.1:4200",
  },
  workers: 1,
});
