export const stirlingScenarios = [

  // 1 — BoA Conservation, rear extension → RED
  {
    name: "BoA — conservation — rear extension — RED",
    postcode: "FK9 4NQ",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "conservation",
    dimensions: { projection: 3, height: 3.2, boundary: 1.8 },
    expectedDecision: "red"
  },

  // 2 — Dunblane detached, small rear extension → GREEN
  {
    name: "Dunblane — rear extension — GREEN",
    postcode: "FK15 0HG",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    dimensions: { projection: 3, height: 3.4, boundary: 2.5 },
    expectedDecision: "green"
  },

  // 3 — Stirling City Centre “not sure”, terraced → AMBER
  {
    name: "Stirling city — unknown designation — AMBER",
    postcode: "FK8 1AX",
    propertyType: "Terraced",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    dimensions: { projection: 2.8, height: 3.2, boundary: 1.9 },
    expectedDecision: "amber"
  },

  // 4 — Callander National Park — side extension → RED
  {
    name: "Callander — national park — side extension — RED",
    postcode: "FK17 8BA",
    propertyType: "Detached",
    projectType: "side-extension",
    areaStatus: "national_park",
    dimensions: { projection: 3.2, height: 3.5, boundary: 1.5 },
    expectedDecision: "red"
  },

  // 5 — St Ninians — garage conversion → GREEN
  {
    name: "St Ninians — garage conversion — GREEN",
    postcode: "FK7 0BP",
    propertyType: "Semi-detached",
    projectType: "garage",
    areaStatus: "none",
    dimensions: {},
    expectedDecision: "green"
  },

  // 6 — Cambusbarron Conservation — dormer → RED
  {
    name: "Cambusbarron — conservation — dormer — RED",
    postcode: "FK7 9RH",
    propertyType: "Detached",
    projectType: "dormer",
    areaStatus: "conservation",
    dimensions: { height: 2.2, boundary: 3 },
    expectedDecision: "red"
  },

  // 7 — Bridge of Allan — garden building, non-designated → GREEN
  {
    name: "BoA — garden building — GREEN",
    postcode: "FK9 4LT",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    dimensions: { height: 2.4, boundary: 2.5 },
    expectedDecision: "green"
  },

  // 8 — Cornton — boundary too close → AMBER
  {
    name: "Cornton — rear extension — boundary <2m — AMBER",
    postcode: "FK9 5HA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "none",
    dimensions: { projection: 3, height: 3.1, boundary: 1.2 },
    expectedDecision: "amber"
  },

  // 9 — Bannockburn — large projection >3m Scotland → RED
  {
    name: "Bannockburn — rear extension 4.5m — RED",
    postcode: "FK7 8HZ",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    dimensions: { projection: 4.5, height: 3.5, boundary: 2.3 },
    expectedDecision: "red"
  },

  // 10 — Riverside — loft conversion non-designated → GREEN
  {
    name: "Riverside — loft conversion — GREEN",
    postcode: "FK8 1RX",
    propertyType: "Terraced",
    projectType: "loft",
    areaStatus: "none",
    dimensions: { height: 2.4 },
    expectedDecision: "green"
  },

  // 11 — Causewayhead — not sure designation — rear extension → AMBER
  {
    name: "Causewayhead — not sure — rear extension — AMBER",
    postcode: "FK9 5HH",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    dimensions: { projection: 3, height: 3.2, boundary: 2.1 },
    expectedDecision: "amber"
  },

  // 12 — Airthrey / Stirling Uni — side extension over 3m → RED
  {
    name: "Airthrey — side extension 3.5m — RED",
    postcode: "FK9 4LA",
    propertyType: "Detached",
    projectType: "side-extension",
    areaStatus: "none",
    dimensions: { projection: 3.5, height: 3.2, boundary: 2.3 },
    expectedDecision: "red"
  },

  // 13 — Torbrex — porch non-designated → GREEN
  {
    name: "Torbrex — porch — GREEN",
    postcode: "FK7 9HD",
    propertyType: "Detached",
    projectType: "front-porch",
    areaStatus: "none",
    dimensions: { projection: 1.2, height: 2.6, boundary: 2.5 },
    expectedDecision: "green"
  },

  // 14 — Kings Park Conservation — garden building -> RED (Scotland CA)
  {
    name: "Kings Park — conservation — garden building — RED",
    postcode: "FK8 2QR",
    propertyType: "Semi-detached",
    projectType: "garden-outbuilding",
    areaStatus: "conservation",
    dimensions: { height: 2.5, boundary: 2.2 },
    expectedDecision: "red"
  },

  // 15 — Raploch — semi-detached — small extension → GREEN
  {
    name: "Raploch — rear extension small — GREEN",
    postcode: "FK8 1UD",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "none",
    dimensions: { projection: 2.5, height: 3.1, boundary: 2.6 },
    expectedDecision: "green"
  },

  // 16 — Stirling rural edge — annexe → RED
  {
    name: "Rural Stirling — annexe — RED",
    postcode: "FK9 4AB",
    propertyType: "Detached",
    projectType: "annexe",
    areaStatus: "none",
    dimensions: { projection: 4, height: 3.8, boundary: 3 },
    expectedDecision: "red"
  },

  // 17 — Bridge of Allan — dormer, non-conservation → GREEN
  {
    name: "BoA — dormer — GREEN",
    postcode: "FK9 4NB",
    propertyType: "Detached",
    projectType: "dormer",
    areaStatus: "none",
    dimensions: { height: 2.4, boundary: 3 },
    expectedDecision: "green"
  },

  // 18 — City Centre tenement flat — rear extension attempt → RED (flats PD removed)
  {
    name: "City Centre flat — extension — RED",
    postcode: "FK8 2LJ",
    propertyType: "Flat",
    projectType: "rear-extension",
    areaStatus: "none",
    dimensions: { projection: 2, height: 3, boundary: 2.4 },
    expectedDecision: "red"
  },

  // 19 — St Ninians — garden building boundary <2m → AMBER
  {
    name: "St Ninians — outbuilding boundary <2m — AMBER",
    postcode: "FK7 0QW",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    dimensions: { height: 2.4, boundary: 1.4 },
    expectedDecision: "amber"
  },

  // 20 — Dunblane — wrap extension (complex) → AMBER
  {
    name: "Dunblane — wrap extension — AMBER",
    postcode: "FK15 9EW",
    propertyType: "Semi-detached",
    projectType: "wrap-extension",
    areaStatus: "none",
    dimensions: { projection: 3, height: 3.5, boundary: 1.9 },
    expectedDecision: "amber"
  }

];