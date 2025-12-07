export const stirlingScenarios = [
  {
    name: "BofA — rear extension — conservation override",
    postcode: "FK9 4LE",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Dunblane — side extension — conservation override",
    postcode: "FK15 0HQ",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    expectedDecision: "red"
  },
  {
    name: "Stirling city — dormer — conservation override",
    postcode: "FK8 2LX",
    propertyType: "Terraced",
    projectType: "dormer",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 0, height: 3.5, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Stirling city — flat — rear extension not PD",
    postcode: "FK8 1EE",
    propertyType: "Flat",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2, height: 3, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Blairlogie CA — front porch — override",
    postcode: "FK9 5QB",
    propertyType: "Detached",
    projectType: "front-porch",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 1.5, height: 3, boundary: 5 },
    expectedDecision: "red"
  },

  // National Park + Rural + Suburban + Other CA = FULL Stirling coverage
  {
    name: "Callander — National Park — garden outbuilding medium risk",
    postcode: "FK17 8BG",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "national_park",
    propertyStatus: "none",
    inputs: { projection: 0, height: 2.5, boundary: 3 },
    expectedDecision: "amber"
  },
  {
    name: "Aberfoyle NP — rear extension above limit",
    postcode: "FK8 3UX",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "national_park",
    propertyStatus: "none",
    inputs: { projection: 5, height: 3, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Kippen rural — small rear extension — PD",
    postcode: "FK8 3DU",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 4 },
    expectedDecision: "green"
  },
  {
    name: "Gargunnock — boundary close — medium risk",
    postcode: "FK8 3BQ",
    propertyType: "Detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2, height: 3, boundary: 1.5 },
    expectedDecision: "amber"
  },
  {
    name: "Cornton — garage conversion — PD",
    postcode: "FK9 5HQ",
    propertyType: "Semi-detached",
    projectType: "garage",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 0, height: 0, boundary: 0 },
    expectedDecision: "green"
  },

  {
    name: "BofA CA — garden building — red",
    postcode: "FK9 4JJ",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 0, height: 2.5, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Dunblane — loft conversion PD",
    postcode: "FK15 0NU",
    propertyType: "Detached",
    projectType: "loft",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 0, height: 2.2, boundary: 5 },
    expectedDecision: "green"
  },
  {
    name: "Dunblane CA — loft conversion — red",
    postcode: "FK15 0DR",
    propertyType: "Semi-detached",
    projectType: "loft",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 0, height: 2.5, boundary: 5 },
    expectedDecision: "red"
  },
  {
    name: "Broomridge Stirling — side extension PD",
    postcode: "FK7 7TZ",
    propertyType: "Detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2, height: 3, boundary: 3 },
    expectedDecision: "green"
  },
  {
    name: "Stirling semi — 4m rear extension — exceeds 3m",
    postcode: "FK7 0LP",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 4, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  {
    name: "Drymen NP — dormer — amber",
    postcode: "G63 0BN",
    propertyType: "Detached",
    projectType: "dormer",
    areaStatus: "national_park",
    propertyStatus: "none",
    inputs: { projection: 0, height: 3.2, boundary: 3 },
    expectedDecision: "amber"
  },
  {
    name: "Stirling flat — porch — red",
    postcode: "FK8 1PW",
    propertyType: "Flat",
    projectType: "front-porch",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 1, height: 3, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Fintry — outbuilding PD",
    postcode: "G63 0YH",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 0, height: 2.5, boundary: 5 },
    expectedDecision: "green"
  },
  {
    name: "BofA CA — annexe — red",
    postcode: "FK9 4NB",
    propertyType: "Detached",
    projectType: "annexe",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 0, height: 3, boundary: 3 },
    expectedDecision: "red"
  },
  {
    name: "Stirling suburban porch PD",
    postcode: "FK7 0PL",
    propertyType: "Detached",
    projectType: "front-porch",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 1.2, height: 3, boundary: 4 },
    expectedDecision: "green"
  },

];
