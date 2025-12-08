// tests/stirling-agent.spec.js
//
// Automated regression suite for Stirling-specific PD scenarios
//

import { test, expect } from '@playwright/test';
import { stirlingScenarios } from './stirling-test-data.js';

// Compact startup log only
console.log(`Loaded Stirling scenarios (count): ${stirlingScenarios.length}`);

const DEMO_URL = "https://result-categories.walker-planning-2.pages.dev/";

// Ensure long-running Stirling cases do not timeout
test.setTimeout(45000);
test.slow();

test.describe("Stirling Council Scenario Suite", () => {

  // ----------------------------------------------------
  // Silence browser console except for real errors
  // ----------------------------------------------------
  test.beforeEach(async ({ page }) => {
    page.on("console", msg => {
      if (msg.type() === "error") {
        console.error("Browser error:", msg.text());
      }
      // All other logs ignored (test mode hydration etc.)
    });
  });

  for (const scenario of stirlingScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      // ------------------------------------------------
      // FIX 1: Disable postcode lookup in the worker
      // ------------------------------------------------
      await page.setExtraHTTPHeaders({
        "x-test-mode": "true"
      });

      // Load page after forcing TEST MODE
      await page.goto(DEMO_URL, { waitUntil: "networkidle" });

      // ------------------------------------------------
      // Fill core fields
      ------------------------------------------------
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

      // ----------------------------------------------------
      // Area / Property Status (Patch A removes async lookup delays)
      // ----------------------------------------------------
      await page.selectOption("#areaStatus", scenario.areaStatus);
      await page.selectOption("#propertyStatus", scenario.propertyStatus);

      // ----------------------------------------------------
      // Run the checker
      // ----------------------------------------------------
      await page.click("#runCheck");

      // We don't output full debug lines anymore
      // console.log(`Checking ${scenario.name}`);

      // Wait for result card OR banner
      await page.waitForSelector("#result-banner, #result-card:not(.hidden)", {
        timeout: 45000
      });

      // Always extract banner after visible
      const banner = await page.waitForSelector("#result-banner", { timeout: 45000 });
      const bannerClass = await banner.getAttribute("class");

      expect(
        bannerClass.includes(scenario.expectedDecision),
        `Expected "${scenario.expectedDecision}" but got "${bannerClass}"`
      ).toBeTruthy();
    });
  }
});