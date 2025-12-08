export const stirlingScenarios = [

  // 1. Bridge of Allan — conservation — rear extension → RED
  {
    name: "BoA — conservation — rear extension — RED",
    postcode: "FK9 4DU",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "conservation",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 2. Dunblane — rear extension — GREEN
  {
    name: "Dunblane — rear extension — GREEN",
    postcode: "FK15 9ET",
    propertyType: "Detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 3. Stirling city — unknown area — AMBER
  {
    name: "Stirling city — unknown designation — AMBER",
    postcode: "FK8 2EA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2 },
    areaStatus: "not_sure",
    propertyStatus: "unknown",
    expectedDecision: "amber"
  },

  // 4. Callander — National Park — side extension → RED
  {
    name: "Callander — national park — side extension — RED",
    postcode: "FK17 8BQ",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    areaStatus: "national_park",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 5. St Ninians — garage conversion — GREEN
  {
    name: "St Ninians — garage conversion — GREEN",
    postcode: "FK7 9JX",
    propertyType: "Detached",
    projectType: "garage",
    inputs: {},
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 6. Cambusbarron — conservation — dormer → RED
  {
    name: "Cambusbarron — conservation — dormer — RED",
    postcode: "FK8 2HP",
    propertyType: "Semi-detached",
    projectType: "dormer",
    inputs: { height: 2.2, boundary: 3 },
    areaStatus: "conservation",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 7. BoA — garden building — GREEN
  {
    name: "BoA — garden building — GREEN",
    postcode: "FK9 4NB",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    inputs: { height: 2.4, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 8. Cornton — rear extension boundary <2m — AMBER
  {
    name: "Cornton — rear extension — boundary under 2m — AMBER",
    postcode: "FK9 5LZ",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 1.2 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "amber"
  },

  // 9. Bannockburn — 4.5m rear extension → RED
  {
    name: "Bannockburn — rear extension 4.5m — RED",
    postcode: "FK7 8LA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 4.5, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 10. Riverside — loft conversion → GREEN
  {
    name: "Riverside — loft conversion — GREEN",
    postcode: "FK8 1TG",
    propertyType: "Semi-detached",
    projectType: "loft",
    inputs: { height: 2.3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 11. Causewayhead — unknown designation — AMBER
  {
    name: "Causewayhead — not sure — rear extension — AMBER",
    postcode: "FK9 5HJ",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2.5 },
    areaStatus: "not_sure",
    propertyStatus: "unknown",
    expectedDecision: "amber"
  },

  // 12. Airthrey — side extension 3.5m → RED
  {
    name: "Airthrey — side extension 3.5m — RED",
    postcode: "FK9 5RA",
    propertyType: "Detached",
    projectType: "side-extension",
    inputs: { projection: 3.5, height: 3, boundary: 2.2 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 13. Torbrex — porch — GREEN
  {
    name: "Torbrex — porch — GREEN",
    postcode: "FK8 2NW",
    propertyType: "Detached",
    projectType: "front-porch",
    inputs: { projection: 1.5, height: 2.5, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 14. Kings Park — conservation + garden building → RED
  {
    name: "Kings Park — conservation — garden building — RED",
    postcode: "FK8 2JS",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    inputs: { height: 2.5, boundary: 3 },
    areaStatus: "conservation",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 15. Raploch — small rear extension — GREEN
  {
    name: "Raploch — rear extension small — GREEN",
    postcode: "FK8 1TZ",
    propertyType: "Terraced",
    projectType: "rear-extension",
    inputs: { projection: 2, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 16. Rural Stirling — annexe — RED
  {
    name: "Rural Stirling — annexe — RED",
    postcode: "FK21 8UH",
    propertyType: "Detached",
    projectType: "annexe",
    inputs: { projection: 4, height: 3.5, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "red"
  },

  // 17. BoA — dormer — GREEN (non-conservation)
  {
    name: "BoA — dormer — GREEN",
    postcode: "FK9 4LY",
    propertyType: "Detached",
    projectType: "dormer",
    inputs: { height: 2.2, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "green"
  },

  // 18. City Centre flat — extension — RED
  {
    name: "City Centre flat — extension — RED",
    postcode: "FK8 1AX",
    propertyType: "Flat",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "listed",   // likely in Stirling city centre
    expectedDecision: "red"
  },

  // 19. St Ninians — outbuilding boundary <2m — AMBER
  {
    name: "St Ninians — outbuilding boundary <2m — AMBER",
    postcode: "FK7 0LN",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    inputs: { height: 2.5, boundary: 1.2 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "amber"
  },

  // 20. Dunblane — wrap extension — AMBER
  {
    name: "Dunblane — wrap extension — AMBER",
    postcode: "FK15 0HQ",
    propertyType: "Detached",
    projectType: "wrap-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    areaStatus: "none",
    propertyStatus: "unknown",
    expectedDecision: "amber"
  }

];