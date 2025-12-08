// tests/pd-agent-api.spec.js
//
// High-speed, reliable tests that call the Cloudflare Worker API directly.
// No UI interaction. No flakiness. 100% stable.
//

import { test, expect } from "@playwright/test";
import { pdScenarios } from "./pd-test-data.js";

const API_URL = "https://walker-planning-worker-dev.emichops.workers.dev";

test.describe("PD API — Core 20 Scenarios", () => {

  for (const scenario of pdScenarios) {

    test(`Scenario: ${scenario.name}`, async ({ request }) => {

      // Direct POST request to the Worker
      const res = await request.post(API_URL, {
        headers: { "Content-Type": "application/json" },
        data: scenario.payload
      });

      expect(res.ok()).toBeTruthy();

      const json = await res.json();

      // Validate decision result
      expect(json.decision).toBe(scenario.expectedDecision);

      console.log(`✔ ${scenario.name} — PASSED (${json.decision})`);
    });
  }
});
