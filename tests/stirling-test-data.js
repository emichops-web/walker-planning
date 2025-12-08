export const stirlingScenarios = [

  // 1 — Bridge of Allan — conservation — rear extension — RED
  {
    name: "BoA — conservation — rear extension — RED",
    postcode: "FK9 4DU",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "conservation",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 2 },
    expectedDecision: "red"
  },

  // 2 — Dunblane — rear extension — GREEN
  {
    name: "Dunblane — rear extension — GREEN",
    postcode: "FK15 9ET",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "green"
  },

  // 3 — Stirling city — not sure — AMBER
  {
    name: "Stirling city — unknown designation — AMBER",
    postcode: "FK8 2EA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 2 },
    expectedDecision: "amber"
  },

  // 4 — Callander — national park — side extension — RED
  {
    name: "Callander — national park — side extension — RED",
    postcode: "FK17 8BQ",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    areaStatus: "national_park",
    propertyStatus: "none",
    dimensions: { projection: 2.5, height: 3, boundary: 2 },
    expectedDecision: "red"
  },

  // 5 — St Ninians — garage conversion — GREEN
  {
    name: "St Ninians — garage conversion — GREEN",
    postcode: "FK7 9JX",
    propertyType: "Detached",
    projectType: "garage",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: {},
    expectedDecision: "green"
  },

  // 6 — Cambusbarron — conservation — dormer — RED
  {
    name: "Cambusbarron — conservation — dormer — RED",
    postcode: "FK7 9NU",
    propertyType: "Semi-detached",
    projectType: "dormer",
    areaStatus: "conservation",
    propertyStatus: "none",
    dimensions: { height: 2.2, boundary: 3 },
    expectedDecision: "red"
  },

  // 7 — Bridge of Allan — garden building — GREEN
  {
    name: "BoA — garden building — GREEN",
    postcode: "FK9 4LT",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { height: 2.4, boundary: 2.5 },
    expectedDecision: "green"
  },

  // 8 — Cornton — rear extension — boundary <2m — AMBER
  {
    name: "Cornton — rear extension — boundary <2m — AMBER",
    postcode: "FK9 5HH",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 1.6 },
    expectedDecision: "amber"
  },

  // 9 — Bannockburn — rear extension 4.5m — RED (Scotland >3m)
  {
    name: "Bannockburn — rear extension 4.5m — RED",
    postcode: "FK7 8HZ",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 4.5, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // 10 — Riverside — loft conversion — GREEN
  {
    name: "Riverside — loft conversion — GREEN",
    postcode: "FK8 1LH",
    propertyType: "Semi-detached",
    projectType: "loft",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { height: 2.3, boundary: 3 },
    expectedDecision: "green"
  },

  // 11 — Causewayhead — not sure — rear extension — AMBER
  {
    name: "Causewayhead — not sure — rear extension — AMBER",
    postcode: "FK9 5HZ",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 2.5 },
    expectedDecision: "amber"
  },

  // 12 — Airthrey — side extension 3.5m — RED
  {
    name: "Airthrey — side extension 3.5m — RED",
    postcode: "FK9 5QL",
    propertyType: "Detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 3.5, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // 13 — Torbrex — porch — GREEN
  {
    name: "Torbrex — porch — GREEN",
    postcode: "FK7 9HD",
    propertyType: "Semi-detached",
    projectType: "front-porch",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 1, height: 2.5, boundary: 3 },
    expectedDecision: "green"
  },

  // 14 — Kings Park — conservation — garden building — RED
  {
    name: "Kings Park — conservation — garden building — RED",
    postcode: "FK8 2LQ",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "conservation",
    propertyStatus: "none",
    dimensions: { height: 2.5, boundary: 3 },
    expectedDecision: "red"
  },

  // 15 — Raploch — small rear extension — GREEN
  {
    name: "Raploch — rear extension small — GREEN",
    postcode: "FK8 1RW",
    propertyType: "Terraced",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 2, height: 2.8, boundary: 2.2 },
    expectedDecision: "green"
  },

  // 16 — Rural Stirling — annexe — RED
  {
    name: "Rural Stirling — annexe — RED",
    postcode: "FK8 3LD",
    propertyType: "Detached",
    projectType: "annexe",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 5, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // 17 — Bridge of Allan — dormer — GREEN
  {
    name: "BoA — dormer — GREEN",
    postcode: "FK9 4NA",
    propertyType: "Semi-detached",
    projectType: "dormer",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { height: 2.2, boundary: 3 },
    expectedDecision: "green"
  },

  // 18 — Stirling city — flat extension — RED
  {
    name: "City Centre flat — extension — RED",
    postcode: "FK8 1AX",
    propertyType: "Flat",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 2, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // 19 — St Ninians — outbuilding <2m boundary — AMBER
  {
    name: "St Ninians — outbuilding boundary <2m — AMBER",
    postcode: "FK7 9EB",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { height: 2.4, boundary: 1.2 },
    expectedDecision: "amber"
  },

  // 20 — Dunblane — wrap extension — AMBER
  {
    name: "Dunblane — wrap extension — AMBER",
    postcode: "FK15 0HQ",
    propertyType: "Detached",
    projectType: "wrap-extension",
    areaStatus: "none",
    propertyStatus: "none",
    dimensions: { projection: 3, height: 3, boundary: 2.5 },
    expectedDecision: "amber"
  }

];