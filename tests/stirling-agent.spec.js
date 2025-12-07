import { test, expect } from '@playwright/test';
import { stirlingScenarios } from './stirling-test-data.js';

const DEMO_URL = "https://walker-planning-2.pages.dev/";

test.describe("Stirling Council PD Scenario Suite", () => {

  for (const scenario of stirlingScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      await page.fill("#postcode", scenario.postcode);
      await page.selectOption("#propertyType", scenario.propertyType);
      await page.selectOption("#projectType", scenario.projectType);

      if (scenario.inputs?.projection !== undefined) {
        await page.fill("#projection", scenario.inputs.projection.toString());
      }
      if (scenario.inputs?.height !== undefined) {
        await page.fill("#height", scenario.inputs.height.toString());
      }
      if (scenario.inputs?.boundary !== undefined) {
        await page.fill("#boundary", scenario.inputs.boundary.toString());
      }

      await page.selectOption("#areaStatus", scenario.areaStatus);
      await page.selectOption("#propertyStatus", scenario.propertyStatus);

      await page.click("#runCheck");

      await page.waitForSelector("#result-banner");

      const bannerClass = await page.locator("#result-banner").getAttribute("class");

      expect(
        bannerClass.includes(scenario.expectedDecision),
        `Expected ${scenario.expectedDecision} but got: ${bannerClass}`
      ).toBeTruthy();

      console.log(`✓ ${scenario.name} — PASSED (${scenario.expectedDecision})`);
    });

  }
});
