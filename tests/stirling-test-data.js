// tests/stirling-test-data.js
//
// 20 Stirling-specific test scenarios
// Covers Conservation Areas, National Park, designated rural areas,
// and typical Stirling housing stock.
//

export const stirlingScenarios = [

  // ------------------------------------------------------------
  // 1. Bridge of Allan – Conservation Area – rear extension
  // ------------------------------------------------------------
  {
    name: "BoA Conservation Area — rear extension — should be RED",
    postcode: "FK9 4DU",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 2. Dunblane – non-designated – rear extension low risk
  // ------------------------------------------------------------
  {
    name: "Dunblane — rear extension — low risk — GREEN",
    postcode: "FK15 9ET",
    propertyType: "Detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2.5 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 3. Stirling City Centre – high conservation authority – unsure
  // ------------------------------------------------------------
  {
    name: "Stirling city — not sure designation — should be AMBER",
    postcode: "FK8 2EA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "not_sure",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 4. Gargunnock – dormer, non-designated – GREEN
  // ------------------------------------------------------------
  {
    name: "Gargunnock — dormer — typical PD — GREEN",
    postcode: "FK8 3BN",
    propertyType: "Detached",
    projectType: "dormer",
    inputs: { projection: 0, height: 2.5, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 5. Bridge of Allan — dormer — conservation — RED
  // ------------------------------------------------------------
  {
    name: "BoA Conservation — dormer — override RED",
    postcode: "FK9 4LE",
    propertyType: "Detached",
    projectType: "dormer",
    inputs: { projection: 0, height: 2.5, boundary: 3 },
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 6. Callander — National Park — side extension — RED
  // ------------------------------------------------------------
  {
    name: "Callander — National Park — side extension — RED",
    postcode: "FK17 8BQ",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    areaStatus: "national_park",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 7. Callander — National Park — garage conversion — AMBER
  // ------------------------------------------------------------
  {
    name: "Callander — National Park — garage conversion — AMBER",
    postcode: "FK17 8BQ",
    propertyType: "Detached",
    projectType: "garage",
    inputs: {},
    areaStatus: "national_park",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 8. Bannockburn — garden building — non-designated — GREEN
  // ------------------------------------------------------------
  {
    name: "Bannockburn — garden building — GREEN",
    postcode: "FK7 8HZ",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    inputs: { height: 2.5, boundary: 2.5 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 9. Bannockburn — garden building — conservation — AMBER
  // ------------------------------------------------------------
  {
    name: "Bannockburn — garden building — conservation — AMBER",
    postcode: "FK7 0HU",
    propertyType: "Semi-detached",
    projectType: "garden-outbuilding",
    inputs: { height: 2.5, boundary: 2.1 },
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 10. St Ninians — porch — green
  // ------------------------------------------------------------
  {
    name: "St Ninians — porch — GREEN",
    postcode: "FK7 9JX",
    propertyType: "Semi-detached",
    projectType: "front-porch",
    inputs: { projection: 1.2, height: 2.5, boundary: 2.5 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 11. Fallin — two-storey — terraced — RED
  // ------------------------------------------------------------
  {
    name: "Fallin — two-storey — terraced — RED",
    postcode: "FK7 7FB",
    propertyType: "Terraced",
    projectType: "two-storey",
    inputs: { projection: 3, height: 5.5, boundary: 1.2 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 12. Bridge of Allan — wrap extension — conservation — RED
  // ------------------------------------------------------------
  {
    name: "BoA — wrap extension — conservation — RED",
    postcode: "FK9 4DU",
    propertyType: "Detached",
    projectType: "wrap-extension",
    inputs: { projection: 3, height: 3, boundary: 1.5 },
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 13. Cambusbarron — rear extension — medium risk — AMBER
  // ------------------------------------------------------------
  {
    name: "Cambusbarron — rear extension — medium risk — AMBER",
    postcode: "FK7 9PQ",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 4, height: 3, boundary: 1.9 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 14. Cambusbarron — loft — green
  // ------------------------------------------------------------
  {
    name: "Cambusbarron — loft — GREEN",
    postcode: "FK7 9PQ",
    propertyType: "Detached",
    projectType: "loft",
    inputs: {},
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  },

  // ------------------------------------------------------------
  // 15. Dunblane — loft — conservation — AMBER
  // ------------------------------------------------------------
  {
    name: "Dunblane — loft — conservation — AMBER",
    postcode: "FK15 0HQ",
    propertyType: "Semi-detached",
    projectType: "loft",
    inputs: {},
    areaStatus: "conservation",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 16. Callander — dormer — national park — RED
  // ------------------------------------------------------------
  {
    name: "Callander — dormer — National Park — RED",
    postcode: "FK17 8BQ",
    propertyType: "Detached",
    projectType: "dormer",
    inputs: { height: 3 },
    areaStatus: "national_park",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 17. Fallin — annexe — red
  // ------------------------------------------------------------
  {
    name: "Fallin — annexe — RED",
    postcode: "FK7 7FB",
    propertyType: "Detached",
    projectType: "annexe",
    inputs: {},
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "red"
  },

  // ------------------------------------------------------------
  // 18. St Ninians — garage conversion — GREEN
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
  },

  // ------------------------------------------------------------
  // 19. Raploch — garden building — amber
  // ------------------------------------------------------------
  {
    name: "Raploch — garden building — AMBER",
    postcode: "FK8 1TW",
    propertyType: "Terraced",
    projectType: "garden-outbuilding",
    inputs: { height: 2.5, boundary: 1.8 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "amber"
  },

  // ------------------------------------------------------------
  // 20. Causewayhead — rear extension — green
  // ------------------------------------------------------------
  {
    name: "Causewayhead — rear extension — GREEN",
    postcode: "FK9 5HA",
    propertyType: "Detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "none",
    expectedDecision: "green"
  }
];
