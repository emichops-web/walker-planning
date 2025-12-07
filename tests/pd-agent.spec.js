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
      await page.click("#runCheck");

      // Wait for the result card to become visible (AI response returned)
      await page.waitForSelector("#result-card:not([hidden])", { timeout: 60000 });

      // Now wait for the likelihood paragraph inside the visible result
      await page.waitForSelector("#result-content p", { timeout: 60000 });

      // Extract the full likelihood paragraph text
      const likelihoodRaw = await page.textContent("#result-content p");

      // Extract the number (e.g., 35 from "Estimated likelihood: 35%")
      const score = parseInt(likelihoodRaw.replace(/\D/g, ""));

      // Extract the decision text ("Likely to qualify", "Unlikely", etc.)
      const decision = await page.textContent(".verdict-pill");

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
