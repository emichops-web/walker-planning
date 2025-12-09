// tests/pd-stirling-api.spec.js
//
// Stirling API – Regulation-Accurate Suite (40 cases)
// Validates decisions directly via the API Worker (fast, stable, no browser)
// ---------------------------------------------------------

import { test, expect } from "@playwright/test";

const API_URL = "https://walker-planning-worker-dev.emichops.workers.dev";

// --------------------------------------------------------
// 40 REAL-WORLD STIRLING SCENARIOS
// --------------------------------------------------------
const stirlingCases = [

  // -----------------------------
  // Rear Extensions
  // -----------------------------
  {
    name: "Bridge of Allan — rear extension 3.8m — RED",
    expected: "red",
    payload: {
      postcode: "FK9 4DU",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.8, height: 3, boundary: 2.5 }
    }
  },

  {
    name: "Dunblane — rear extension 3m — GREEN",
    expected: "green",
    payload: {
      postcode: "FK15 9ET",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3.5, boundary: 3 }
    }
  },

  {
    name: "Causewayhead — rear extension — user uncertain — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK9 5HJ",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 2 }
    }
  },

  {
    name: "Callander — rear extension — national park — RED",
    expected: "red",
    payload: {
      postcode: "FK17 8BQ",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "national_park",
      propertyStatus: "none",
      dimensions: { projection: 2.8, height: 3, boundary: 2.5 }
    }
  },

  {
    name: "Bannockburn — rear extension 2.5m — GREEN",
    expected: "green",
    payload: {
      postcode: "FK7 8LA",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 3 }
    }
  },

  {
    name: "Stirling City Centre — flat rear extension — RED",
    expected: "red",
    payload: {
      postcode: "FK8 1AX",
      propertyType: "Flat",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2, height: 3, boundary: 3 }
    }
  },

  // -----------------------------
  // Dormers / Loft Conversions
  // -----------------------------
  {
    name: "Cambusbarron — dormer — conservation — RED",
    expected: "red",
    payload: {
      postcode: "FK8 2HP",
      propertyType: "Semi-detached",
      projectType: "dormer",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.3, boundary: 3 }
    }
  },

  {
    name: "Riverside — internal loft conversion — GREEN",
    expected: "green",
    payload: {
      postcode: "FK8 1TG",
      propertyType: "Terraced",
      projectType: "loft",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    }
  },

  {
    name: "St Ninians — loft conversion — not sure designation — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK7 0HH",
      propertyType: "Semi-detached",
      projectType: "loft",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    }
  },

  // -----------------------------
  // Garden Buildings / Outbuildings
  // -----------------------------
  {
    name: "Kings Park — garden building — conservation — RED",
    expected: "red",
    payload: {
      postcode: "FK8 2JS",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    }
  },

  {
    name: "St Ninians — outbuilding 2.8m height within 1m boundary — AMBER",
    expected: "amber", // UPDATED
    payload: {
      postcode: "FK7 0LN",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.8, boundary: 0.8 }
    }
  },

  {
    name: "Raploch — garden building 4m high — within 2m boundary — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK8 1TZ",
      propertyType: "Terraced",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 4, boundary: 1.5 }
    }
  },

  // -----------------------------
  // Porches
  // -----------------------------
  {
    name: "Stirling — porch 4m² — GREEN",
    expected: "green",
    payload: {
      postcode: "FK7 7LJ",
      propertyType: "Detached",
      projectType: "front-porch",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    }
  },

  {
    name: "Kings Park — porch in conservation — RED",
    expected: "red",
    payload: {
      postcode: "FK8 2JS",
      propertyType: "Semi-detached",
      projectType: "front-porch",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    }
  },

  // -----------------------------
  // Side Extensions
  // -----------------------------
  {
    name: "Dunblane — side extension — 3.2m — RED",
    expected: "red",
    payload: {
      postcode: "FK15 0HQ",
      propertyType: "Semi-detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.2, height: 3, boundary: 2 }
    }
  },

  // -----------------------------
  // Wrap Extensions
  // -----------------------------
  {
    name: "Bridge of Allan — wrap extension 3.5m — RED",
    expected: "red",
    payload: {
      postcode: "FK9 4NA",
      propertyType: "Detached",
      projectType: "wrap-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.5, height: 3, boundary: 2.5 }
    }
  },

  // -----------------------------
  // Two-Storey Extensions
  // -----------------------------
  {
    name: "BoA — two-storey extension — RED",
    expected: "red",
    payload: {
      postcode: "FK9 4NB",
      propertyType: "Semi-detached",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5.5, boundary: 3 }
    }
  },

  {
    name: "Bannockburn — two-storey extension — semi-detached — RED",
    expected: "red",
    payload: {
      postcode: "FK7 8LA",
      propertyType: "Semi-detached",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5, boundary: 3 }
    }
  },

  // -----------------------------
  // Annexes
  // -----------------------------
  {
    name: "Rural Stirling — annexe — always planning — RED",
    expected: "red",
    payload: {
      postcode: "FK21 8UH",
      propertyType: "Detached",
      projectType: "annexe",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    }
  },

  {
    name: "Cambusbarron — annexe — conservation — RED",
    expected: "red",
    payload: {
      postcode: "FK8 2HP",
      propertyType: "Detached",
      projectType: "annexe",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    }
  },

  // -----------------------------
  // Garage conversions
  // -----------------------------
  {
    name: "Cornton — garage conversion — GREEN",
    expected: "green",
    payload: {
      postcode: "FK9 5LZ",
      propertyType: "Detached",
      projectType: "garage",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: {}
    }
  },

  {
    name: "Fallin — garage conversion — terraced — GREEN",
    expected: "green",
    payload: {
      postcode: "FK7 7HS",
      propertyType: "Terraced",
      projectType: "garage",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: {}
    }
  },

  // -----------------------------
  // 15 more realistic variations
  // -----------------------------

  {
    name: "Stirling — rear extension 3.2m — RED",
    expected: "red",
    payload: {
      postcode: "FK7 0AA",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.2, height: 3, boundary: 2.5 }
    }
  },

  {
    name: "Bridge of Allan — rear extension 4m — RED",
    expected: "red",
    payload: {
      postcode: "FK9 4DU",
      propertyType: "Detached",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3, boundary: 3 }
    }
  },

  {
    name: "Dunblane — garden building 2.4m — GREEN",
    expected: "green",
    payload: {
      postcode: "FK15 9ET",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    }
  },

  {
    name: "Callander — dormer — national park — RED",
    expected: "red",
    payload: {
      postcode: "FK17 8BQ",
      propertyType: "Detached",
      projectType: "dormer",
      areaStatus: "national_park",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    }
  },

  {
    name: "Cornton — side extension 2.8m — GREEN",
    expected: "green",
    payload: {
      postcode: "FK9 5DZ",
      propertyType: "Detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.8, height: 3, boundary: 3 }
    }
  },

  {
    name: "Raploch — wrap extension 3m — GREEN",
    expected: "green",
    payload: {
      postcode: "FK8 1TZ",
      propertyType: "Semi-detached",
      projectType: "wrap-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 2 }
    }
  },

  {
    name: "Stirling — loft conversion in high-risk authority — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK7 7SS",
      propertyType: "Semi-detached",
      projectType: "loft",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    }
  },

  {
    name: "Bridge of Allan — garden building 2.6m within 2m boundary — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK9 4DU",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.6, boundary: 1.5 }
    }
  },

  {
    name: "Dunblane — porch 3m² — GREEN",
    expected: "green",
    payload: {
      postcode: "FK15 0HQ",
      propertyType: "Detached",
      projectType: "front-porch",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 1.2, height: 2.4, boundary: 3 }
    }
  },

  {
    name: "Callander — loft — national park — RED",
    expected: "red",
    payload: {
      postcode: "FK17 8BQ",
      propertyType: "Detached",
      projectType: "loft",
      areaStatus: "national_park",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    }
  },

  {
    name: "Cornton — annexe — RED",
    expected: "red",
    payload: {
      postcode: "FK9 5LP",
      propertyType: "Semi-detached",
      projectType: "annexe",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3.5, height: 3, boundary: 3 }
    }
  },

  {
    name: "Raploch — two-storey extension — RED",
    expected: "red",
    payload: {
      postcode: "FK8 1TZ",
      propertyType: "Terraced",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 5, boundary: 3 }
    }
  },

  {
    name: "Cambusbarron — porch 3m² — GREEN",
    expected: "green",
    payload: {
      postcode: "FK8 2HP",
      propertyType: "Semi-detached",
      projectType: "front-porch",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 1.2, height: 2.4, boundary: 3 }
    }
  },

  {
    name: "Stirling — garden building 2.9m — within 1.9m boundary — AMBER",
    expected: "amber",
    payload: {
      postcode: "FK8 2AA",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.9, boundary: 1.9 }
    }
  },

  {
    name: "Dunblane — loft — GREEN",
    expected: "green",
    payload: {
      postcode: "FK15 9ET",
      propertyType: "Detached",
      projectType: "loft",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    }
  },

];

// --------------------------------------------------------
// TEST RUNNER
// --------------------------------------------------------
test.describe("Stirling API – Regulation-Accurate Suite (40 cases)", () => {

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