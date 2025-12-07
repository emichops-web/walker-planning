import { test, expect } from '@playwright/test';
import { scenarios } from './pd-test-data.js';

const DEMO_URL = "https://result-categories.walker-planning-2.pages.dev/";   // your branch preview URL

test.describe("Automated PD Scenario QA Suite", () => {

  for (const scenario of scenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      // Load the site
      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      // Fill core form fields
      await page.fill("#postcode", scenario.postcode);
      await page.selectOption("#propertyType", scenario.propertyType);
      await page.selectOption("#projectType", scenario.projectType);

      // If dimension fields appear, fill them
      if (scenario.inputs?.projection !== undefined) {
        await page.fill("#projection", scenario.inputs.projection.toString());
      }
      if (scenario.inputs?.height !== undefined) {
        await page.fill("#height", scenario.inputs.height.toString());
      }
      if (scenario.inputs?.boundary !== undefined) {
        await page.fill("#boundary", scenario.inputs.boundary.toString());
      }

      // Area + property status
      await page.selectOption("#areaStatus", scenario.areaStatus);
      await page.selectOption("#propertyStatus", scenario.propertyStatus);

      // Submit
      await page.click("#runCheck");

      // Wait for the result card
      await page.waitForSelector("#result-card:not(.hidden)", { timeout: 60000 });

      // Wait for the NEW banner element
      const banner = await page.waitForSelector("#result-banner", { timeout: 60000 });

      // Extract banner classes
      const bannerClass = await banner.getAttribute("class");

      // Expect correct category: "green", "amber", or "red"
      expect(
        bannerClass.includes(scenario.expectedDecision),
        `Expected decision category '${scenario.expectedDecision}' but got classes: '${bannerClass}'`
      ).toBeTruthy();

      console.log(`✓ ${scenario.name} — PASSED (${scenario.expectedDecision})`);
    });
  }
});