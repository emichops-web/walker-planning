// tests/pd-agent.spec.js

import { test, expect } from '@playwright/test';
import { scenarios } from './pd-test-data.js';

const DEMO_URL = "https://walker-planning-2.pages.dev/";

test.describe("Automated PD Scenario QA Suite", () => {
  for (const scenario of scenarios) {
    test(`Scenario: ${scenario.name}`, async ({ page }) => {

      // Load demo site
      await page.goto(DEMO_URL);

      // Fill postcode
      await page.fill("#postcode", scenario.postcode);

      // Select project type
      await page.selectOption("#projectType", scenario.projectType);

      // Fill dimensions (if applicable)
      if (scenario.inputs.projection !== undefined) {
        await page.fill("#projection", scenario.inputs.projection.toString());
      }
      if (scenario.inputs.height !== undefined) {
        await page.fill("#height", scenario.inputs.height.toString());
      }
      if (scenario.inputs.boundary !== undefined) {
        await page.fill("#boundary", scenario.inputs.boundary.toString());
      }

      // Generate report
      await page.click("#generateReportBtn");

      // Wait for results
      await page.waitForSelector("#pd-score", { timeout: 20000 });

      // Extract score
      const scoreText = await page.textContent("#pd-score");
      const score = parseInt(scoreText.replace("%", "").trim());

      // Extract decision
      const decision = await page.textContent("#pd-decision");

      // Validate score range
      expect(score).toBeGreaterThanOrEqual(scenario.expectedScoreMin);
      expect(score).toBeLessThanOrEqual(scenario.expectedScoreMax);

      // Validate decision
      expect(decision).toContain(scenario.expectedDecision);

      console.log(
        `✓ ${scenario.name} — PASSED — Score: ${score}% — Decision: ${decision}`
      );
    });
  }
});
