// tests/stirling-test-data.js
//
// Minimal Stirling regression suite (5 scenarios)
// Ensures UI dimension rendering + Worker logic are functional.
// Once stable, you can expand back to 20.
//

export const stirlingScenarios = [

  // ------------------------------------------------------------
  // 1. Bridge of Allan — Conservation Area — rear extension → RED
  // ------------------------------------------------------------
  {
    name: "BoA — conservation — rear extension — RED",
    postcode: "FK9 4DU",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 2. Dunblane — non-designated — rear extension → GREEN
  // ------------------------------------------------------------
  {
    name: "Dunblane — rear extension — GREEN",
    postcode: "FK15 9ET",
    propertyType: "Detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 3. Stirling City — uncertain designation — should be AMBER
  // ------------------------------------------------------------
  {
    name: "Stirling city — unknown designation — AMBER",
    postcode: "FK8 2EA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "not_sure",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 4. Callander — National Park — side extension → RED
  // ------------------------------------------------------------
  {
    name: "Callander — national park — side extension — RED",
    postcode: "FK17 8BQ",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    areaStatus: "national_park",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 5. St Ninians — garage conversion — GREEN
  // ------------------------------------------------------------
  {
    name: "St Ninians — garage conversion — GREEN",
    postcode: "FK7 9JX",
    propertyType: "Detached",
    projectType: "garage",
    inputs: {},
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  }

];