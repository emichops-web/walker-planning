// tests/pd-test-data.js

export const scenarios = [
  // ----------------------------------------
  // URBAN SCENARIOS
  // ----------------------------------------
  {
    name: "Rear extension – 3m detached (Bannockburn)",
    postcode: "FK7 8LJ",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedScoreMin: 85,
    expectedScoreMax: 95,
    expectedDecision: "Likely PD"
  },
  {
    name: "Rear extension – 3m semi-detached",
    postcode: "FK9 5JZ",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 2.5 },
    expectedScoreMin: 80,
    expectedScoreMax: 90,
    expectedDecision: "Likely PD"
  },
  {
    name: "Two-storey side extension <1m from boundary",
    postcode: "FK7 0BU",
    projectType: "two-storey",
    inputs: { height: 6, boundary: 0.5 },
    expectedScoreMin: 50,
    expectedScoreMax: 70,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Rear dormer loft conversion",
    postcode: "FK9 5BG",
    projectType: "loft",
    inputs: { height: 2.5 },
    expectedScoreMin: 85,
    expectedScoreMax: 95,
    expectedDecision: "Likely PD"
  },
  {
    name: "Porch, 2m projection",
    postcode: "FK7 7LL",
    projectType: "porch",
    inputs: { projection: 2, height: 3 },
    expectedScoreMin: 90,
    expectedScoreMax: 100,
    expectedDecision: "Likely PD"
  },
  {
    name: "Outbuilding 2.5m height at boundary",
    postcode: "FK8 2HA",
    projectType: "outbuilding",
    inputs: { height: 2.5, boundary: 1 },
    expectedScoreMin: 85,
    expectedScoreMax: 95,
    expectedDecision: "Likely PD"
  },
  {
    name: "Boundary fence 2m next to road",
    postcode: "FK7 8AQ",
    projectType: "fence",
    inputs: { height: 2 },
    expectedScoreMin: 60,
    expectedScoreMax: 75,
    expectedDecision: "May Require Planning"
  },

  // ----------------------------------------
  // RURAL SCENARIOS
  // ----------------------------------------
  {
    name: "5m rural rear extension (exceeds PD)",
    postcode: "FK16 6JG",
    projectType: "rear-extension",
    inputs: { projection: 5, height: 3, boundary: 5 },
    expectedScoreMin: 45,
    expectedScoreMax: 60,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Large rural outbuilding 4m high",
    postcode: "FK8 3SA",
    projectType: "outbuilding",
    inputs: { height: 4 },
    expectedScoreMin: 20,
    expectedScoreMax: 45,
    expectedDecision: "Unlikely PD"
  },
  {
    name: "Rural roof solar panels",
    postcode: "FK8 3JX",
    projectType: "solar-roof",
    inputs: {},
    expectedScoreMin: 90,
    expectedScoreMax: 100,
    expectedDecision: "Likely PD"
  },
  {
    name: "Ground solar array 2.5m high",
    postcode: "FK16 6ER",
    projectType: "solar-ground",
    inputs: { height: 2.5 },
    expectedScoreMin: 55,
    expectedScoreMax: 70,
    expectedDecision: "May Require Planning"
  },

  // ----------------------------------------
  // CONSERVATION AREA SCENARIOS
  // ----------------------------------------
  {
    name: "Rear extension in Conservation Area",
    postcode: "FK9 4AY",
    projectType: "rear-extension",
    inputs: { projection: 2.5, height: 3 },
    expectedScoreMin: 60,
    expectedScoreMax: 75,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Front porch in Conservation Area",
    postcode: "FK15 0DR",
    projectType: "porch",
    inputs: { projection: 1.5, height: 3 },
    expectedScoreMin: 20,
    expectedScoreMax: 40,
    expectedDecision: "Unlikely PD"
  },
  {
    name: "Front rooflight in Conservation Area",
    postcode: "FK8 2LQ",
    projectType: "rooflight",
    inputs: {},
    expectedScoreMin: 50,
    expectedScoreMax: 65,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Window replacement to uPVC in CA",
    postcode: "FK9 4NB",
    projectType: "window-replacement",
    inputs: {},
    expectedScoreMin: 20,
    expectedScoreMax: 30,
    expectedDecision: "Unlikely PD"
  },

  // ----------------------------------------
  // NATIONAL PARK SCENARIOS
  // ----------------------------------------
  {
    name: "Rear extension inside National Park",
    postcode: "FK17 8BG",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3 },
    expectedScoreMin: 50,
    expectedScoreMax: 65,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Outbuilding near protected woodland",
    postcode: "FK8 3TD",
    projectType: "outbuilding",
    inputs: { height: 2.5, boundary: 2 },
    expectedScoreMin: 50,
    expectedScoreMax: 65,
    expectedDecision: "May Require Planning"
  },
  {
    name: "Replacement garage, same footprint",
    postcode: "FK8 3SY",
    projectType: "garage",
    inputs: { height: 3, boundary: 2 },
    expectedScoreMin: 85,
    expectedScoreMax: 95,
    expectedDecision: "Likely PD"
  },

  // ----------------------------------------
  // FLATS + COMMERCIAL
  // ----------------------------------------
  {
    name: "Flat rear extension request",
    postcode: "FK7 7LZ",
    projectType: "rear-extension",
    inputs: { projection: 2 },
    expectedScoreMin: 0,
    expectedScoreMax: 15,
    expectedDecision: "Unlikely PD"
  },
  {
    name: "Shopfront glazing alteration",
    postcode: "FK8 1HL",
    projectType: "shopfront",
    inputs: {},
    expectedScoreMin: 55,
    expectedScoreMax: 70,
    expectedDecision: "May Require Planning"
  }
];
