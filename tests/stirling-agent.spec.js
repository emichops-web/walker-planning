// tests/stirling-agent.spec.js
//
// Automated regression suite for Stirling-specific PD scenarios
//
console.log("Loaded Stirling scenarios:", stirlingScenarios);

import { test, expect } from '@playwright/test';
import { stirlingScenarios } from './stirling-test-data.js';

const DEMO_URL = "https://result-categories.walker-planning-2.pages.dev/";

// Ensure long-running Stirling cases do not timeout
test.setTimeout(45000);
test.slow();

test.describe("Stirling Council Scenario Suite", () => {

  for (const scenario of stirlingScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      // Fill core fields
      await page.fill("#postcode", scenario.postcode);
      await page.selectOption("#propertyType", scenario.propertyType);
      await page.selectOption("#projectType", scenario.projectType);

      // Dimensions if needed
      if (scenario.inputs?.projection !== undefined) {
        await page.fill("#projection", scenario.inputs.projection.toString());
      }
      if (scenario.inputs?.height !== undefined) {
        await page.fill("#height", scenario.inputs.height.toString());
      }
      if (scenario.inputs?.boundary !== undefined) {
        await page.fill("#boundary", scenario.inputs.boundary.toString());
      }

      // Area/status fields
      await page.selectOption("#areaStatus", scenario.areaStatus);
      await page.selectOption("#propertyStatus", scenario.propertyStatus);

      // Run the checker
      await page.click("#runCheck");

      // More reliable wait — avoids Cloudflare networkidle hang
      console.log("DEBUG: Waiting for result for scenario:", scenario.name);

      await page.waitForSelector("#result-banner, #result-card:not(.hidden)", {
        timeout: 45000
      });

      // Now safely wait for the banner
      const banner = await page.waitForSelector("#result-banner", { timeout: 45000 });
      const bannerClass = await banner.getAttribute("class");

      expect(
        bannerClass.includes(scenario.expectedDecision),
        `Expected decision "${scenario.expectedDecision}" but got "${bannerClass}"`
      ).toBeTruthy();

      console.log(`✓ ${scenario.name} — PASSED (${scenario.expectedDecision})`);
    });
  }
});