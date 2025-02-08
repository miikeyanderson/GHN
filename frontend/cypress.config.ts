import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "9qzv5r",
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents() {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
  video: true,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2,
    openMode: 0
  }
});
