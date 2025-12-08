// tests/pd-agent-api.spec.js
// High-speed API regression suite — 20 generic scenarios

import { test, expect } from "@playwright/test";

const API_URL = "https://walker-planning-worker-dev.emichops.workers.dev";

const scenarios = [
  {
    name: "Rear extension — 3m detached — Scotland — GREEN",
    payload: {
      postcode: "PH7 4BL",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Rear extension — Scottish Conservation Area — RED",
    payload: {
      postcode: "FK9 4DU",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 2 }
    },
    expectedDecision: "red"
  },

  {
    name: "Side extension — semi-detached — England — GREEN",
    payload: {
      postcode: "GL50 1AA",
      propertyType: "Semi-detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 2.5 }
    },
    expectedDecision: "green"
  },

  {
    name: "Side extension — boundary too close — England — AMBER",
    payload: {
      postcode: "B23 6FF",
      propertyType: "Detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 1.2 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Two-storey extension — Scotland — terraced — RED",
    payload: {
      postcode: "FK8 1AB",
      propertyType: "Terraced",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5, boundary: 2 }
    },
    expectedDecision: "red"
  },

  {
    name: "Rear extension — 5m projection — England — AMBER",
    payload: {
      postcode: "OX1 2AA",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 5, height: 3, boundary: 3 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Rear extension — 9m projection — England — RED",
    payload: {
      postcode: "CV1 1AA",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 9, height: 3, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Rear extension — Scotland — not sure designation — AMBER",
    payload: {
      postcode: "FK7 0AA",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 3 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Garage conversion — detached — Scotland — GREEN",
    payload: {
      postcode: "PH1 1AA",
      propertyType: "Detached",
      projectType: "garage",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: {}
    },
    expectedDecision: "green"
  },

  {
    name: "Loft conversion — semi-detached — England — GREEN",
    payload: {
      postcode: "WS1 2AA",
      propertyType: "Semi-detached",
      projectType: "loft",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.2, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Loft conversion — England — conservation — AMBER",
    payload: {
      postcode: "BA1 1AA",
      propertyType: "Detached",
      projectType: "loft",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Dormer — Scotland — conservation override — RED",
    payload: {
      postcode: "FK8 2AA",
      propertyType: "Semi-detached",
      projectType: "dormer",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Garden building — England — detached — GREEN",
    payload: {
      postcode: "LE1 1AA",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Garden building — Scotland — conservation — RED",
    payload: {
      postcode: "EH12 1AA",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Porch — semi-detached — England — GREEN",
    payload: {
      postcode: "W1A 1AA",
      propertyType: "Semi-detached",
      projectType: "front-porch",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Porch — Scotland — conservation — RED",
    payload: {
      postcode: "FK8 3AA",
      propertyType: "Detached",
      projectType: "front-porch",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Annexe — Scotland — RED",
    payload: {
      postcode: "PH2 8AA",
      propertyType: "Detached",
      projectType: "annexe",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Rear extension — Scotland — not sure — AMBER",
    payload: {
      postcode: "FK9 4AA",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 3 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Rear extension — flat — England — RED",
    payload: {
      postcode: "EC1A 1AA",
      propertyType: "Flat",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 3 }
    },
    expectedDecision: "red"
  }
];

test.describe("PD API — Core 20 Scenarios", () => {
  for (const scenario of scenarios) {
    test(`Scenario: ${scenario.name}`, async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { "Content-Type": "application/json" },
        data: scenario.payload
      });

      expect(response.ok()).toBeTruthy();

      const json = await response.json();

      expect(json.decision).toBe(scenario.expectedDecision);

      console.log(`✔ ${scenario.name} — PASSED (${json.decision})`);
    });
  }
});