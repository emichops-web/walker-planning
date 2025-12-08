// tests/stirling-agent.spec.js
//
// Automated regression suite for Stirling-specific PD scenarios
//

import { test, expect } from '@playwright/test';
import { stirlingScenarios } from './stirling-test-data.js';

console.log("Loaded Stirling scenarios:", stirlingScenarios);

const DEMO_URL = "https://result-categories.walker-planning-2.pages.dev/";

// Ensure long-running Stirling cases do not timeout
test.setTimeout(45000);
test.slow();

test.describe("Stirling Council Scenario Suite", () => {

  for (const scenario of stirlingScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      // ------------------------------------------------
      // FIX 1: Disable postcode lookup in the worker
      // ------------------------------------------------
      await page.setExtraHTTPHeaders({
        "x-test-mode": "true"
      });

      // Load page after forcing test mode
      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      // ------------------------------------------------
      // Fill core fields
      // ------------------------------------------------
      await page.fill("#postcode", scenario.postcode);
      await page.selectOption("#propertyType", scenario.propertyType);
      await page.selectOption("#projectType", scenario.projectType);

      // ------------------------------------------------
      // Dimensions if needed
      // ------------------------------------------------
      if (scenario.inputs?.projection !== undefined) {
        await page.fill("#projection", scenario.inputs.projection.toString());
      }
      if (scenario.inputs?.height !== undefined) {
        await page.fill("#height", scenario.inputs.height.toString());
      }
      if (scenario.inputs?.boundary !== undefined) {
        await page.fill("#boundary", scenario.inputs.boundary.toString());
      }

      // ------------------------------------------------
      // Area/status fields
      // ------------------------------------------------
      await page.selectOption("#areaStatus", scenario.areaStatus);
      await page.selectOption("#propertyStatus", scenario.propertyStatus);

      // ------------------------------------------------
      // Run check
      // ------------------------------------------------
      await page.click("#runCheck");

      console.log("DEBUG: Waiting for result for scenario:", scenario.name);

      await page.waitForSelector("#result-banner, #result-card:not(.hidden)", {
        timeout: 45000
      });

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