// tests/stirling-agent.spec.js
//
// Automated regression suite for Stirling-specific PD scenarios
//

import { test, expect } from '@playwright/test';
import { stirlingScenarios } from './stirling-test-data.js';

const DEMO_URL = "https://walker-planning-2.pages.dev/";   // branch preview

test.describe("Stirling Council Scenario Suite", () => {

  for (const scenario of stirlingScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      // Fill core fields
      await page.fill("#postcode", scenario.postcode);
      await page.selectOption("#propertyType", scenario.propertyType);
      await page.selectOption("#projectType", scenario.projectType);

      // Fill optional dimensions
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

      // Wait for banner
      const banner = await page.waitForSelector("#result-banner", { timeout: 60000 });
      const bannerClass = await banner.getAttribute("class");

      expect(
        bannerClass.includes(scenario.expectedDecision),
        `Expected "${scenario.expectedDecision}" but got "${bannerClass}"`
      ).toBeTruthy();

      console.log(`✓ ${scenario.name} — PASSED (${scenario.expectedDecision})`);
    });
  }
});
