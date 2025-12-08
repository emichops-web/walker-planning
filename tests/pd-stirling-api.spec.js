// tests/pd-stirling-api.spec.js
//
// Stirling API – Regulation-Accurate Suite (20 cases)
// Validates decisions via the API Worker (fast + stable)
// ---------------------------------------------------------

import { test, expect } from "@playwright/test";

const API_URL = "https://walker-planning-worker-dev.emichops.workers.dev";

// ----------------------------
// 20 Real-World Stirling Scenarios
// ----------------------------
const stirlingCases = [

  {
    name: "Bridge of Allan — rear extension 3.8m — RED",
    payload: {
      postcode: "FK9 4DU",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.8, height: 3, boundary: 2.5 }
    },
    expected: "red"
  },

  {
    name: "Dunblane — rear extension 3m — GREEN",
    payload: {
      postcode: "FK15 9ET",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3.5, boundary: 3 }
    },
    expected: "green"
  },

  {
    name: "Cambusbarron — dormer — conservation — RED",
    payload: {
      postcode: "FK8 2HP",
      propertyType: "Semi-detached",
      projectType: "dormer",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.3, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Causewayhead — rear extension — user uncertain — AMBER",
    payload: {
      postcode: "FK9 5HJ",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 2 }
    },
    expected: "amber"
  },

  {
    name: "Riverside — internal loft conversion — GREEN",
    payload: {
      postcode: "FK8 1TG",
      propertyType: "Terraced",
      projectType: "loft",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    },
    expected: "green"
  },

  {
    name: "Kings Park — garden building — conservation — RED",
    payload: {
      postcode: "FK8 2JS",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Bannockburn — rear extension 2.5m — GREEN",
    payload: {
      postcode: "FK7 8LA",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 3 }
    },
    expected: "green"
  },

  {
    name: "St Ninians — outbuilding 2.8m height within 1m boundary — AMBER",
    payload: {
      postcode: "FK7 0LN",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.8, boundary: 0.8 }
    },
    expected: "amber"
  },

  {
    name: "BoA — two-storey extension — RED",
    payload: {
      postcode: "FK9 4NB",
      propertyType: "Semi-detached",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5.5, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Rural Stirling — annexe — always planning — RED",
    payload: {
      postcode: "FK21 8UH",
      propertyType: "Detached",
      projectType: "annexe",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    },
    expected: "red"
  }

  {
    name: "Stirling City Centre — flat rear extension — RED",
    payload: {
      postcode: "FK8 1AX",
      propertyType: "Flat",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2, height: 3, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Bridge of Allan — wrap extension 3.5m — AMBER",
    payload: {
      postcode: "FK9 4NA",
      propertyType: "Detached",
      projectType: "wrap-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.5, height: 3, boundary: 2.5 }
    },
    expected: "amber"
  },

  {
    name: "Callander — rear extension — national park — RED",
    payload: {
      postcode: "FK17 8BQ",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "national_park",
      propertyStatus: "none",
      dimensions: { projection: 2.8, height: 3, boundary: 2.5 }
    },
    expected: "red"
  },

  {
    name: "Dunblane — side extension — 3.2m — AMBER",
    payload: {
      postcode: "FK15 0HQ",
      propertyType: "Semi-detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.2, height: 3, boundary: 2 }
    },
    expected: "amber"
  },

  {
    name: "Stirling — porch 4m² — GREEN",
    payload: {
      postcode: "FK7 7LJ",
      propertyType: "Detached",
      projectType: "front-porch",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    },
    expected: "green"
  },

  {
    name: "Kings Park — porch in conservation — RED",
    payload: {
      postcode: "FK8 2JS",
      propertyType: "Semi-detached",
      projectType: "front-porch",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Raploch — garden building 4m high — within 2m boundary — RED",
    payload: {
      postcode: "FK8 1TZ",
      propertyType: "Terraced",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 4, boundary: 1.5 }
    },
    expected: "red"
  },

  {
    name: "St Ninians — loft conversion — not sure designation — AMBER",
    payload: {
      postcode: "FK7 0HH",
      propertyType: "Semi-detached",
      projectType: "loft",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    },
    expected: "amber"
  },

  {
    name: "Cambusbarron — annexe — conservation — RED",
    payload: {
      postcode: "FK8 2HP",
      propertyType: "Detached",
      projectType: "annexe",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    },
    expected: "red"
  },

  {
    name: "Bannockburn — two-storey extension — semi-detached — RED",
    payload: {
      postcode: "FK7 8LA",
      propertyType: "Semi-detached",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5, boundary: 3 }
    },
    expected: "red"
  }

];

// -----------------------------------
// TEST RUNNER
// -----------------------------------
test.describe("Stirling API – Regulation-Accurate Suite (20 cases)", () => {

  for (const scenario of stirlingCases) {

    test(`Scenario: ${scenario.name}`, async ({ request }) => {

      const res = await request.post(API_URL, {
        headers: {
          "Content-Type": "application/json",
          "x-test-mode": "true"
        },
        data: scenario.payload
      });

      expect(res.ok()).toBeTruthy();

      const json = await res.json();

      expect(json.decision).toBe(
        scenario.expected,
        `Expected ${scenario.expected} but received ${json.decision}`
      );

      console.log(`✔ ${scenario.name} — PASSED (${json.decision})`);
    });

  }

});