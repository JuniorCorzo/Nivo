import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env["CI"]),
  fullyParallel: true,
  projects: [
    {
      name: "lightpanda",
      use: {
        ...devices["Desktop Chrome"],
        connectOptions: {
          wsEndpoint: process.env["LIGHTPANDA_WS"] || "ws://127.0.0.1:9222",
        },
      },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env["CI"] ? 2 : 0,
  testDir: "./e2e/specs",
  use: {
    baseURL: process.env["E2E_BASE_URL"] || "http://localhost:4200",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  workers: process.env["CI"] ? 1 : undefined,
});
