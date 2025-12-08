// tests/pd-test-data.js
//
// 20 Core Generic PD Scenarios (API version)
// Covers England Scotland, PD-friendly cases, overrides,
// boundary issues, height issues, flats, and high-risk types.
//

export const pdScenarios = [

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
      postcode: "NG1 5FS",
      propertyType: "Semi-detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Side extension — boundary too close — England — AMBER",
    payload: {
      postcode: "B1 1AA",
      propertyType: "Semi-detached",
      projectType: "side-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 2.5, height: 3, boundary: 1 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Two-storey extension — Scotland — terraced — RED",
    payload: {
      postcode: "KY12 8AB",
      propertyType: "Terraced",
      projectType: "two-storey",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 6, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Rear extension — 5m projection — England — AMBER",
    payload: {
      postcode: "LE2 1AA",
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
      postcode: "LS12 3BD",
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
      postcode: "IV1 1AA",
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
      postcode: "PH1 2AB",
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
      postcode: "M4 1AB",
      propertyType: "Semi-detached",
      projectType: "loft",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.3, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Loft conversion — England — conservation — AMBER",
    payload: {
      postcode: "YO1 7HY",
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
      postcode: "EH1 3QR",
      propertyType: "Semi-detached",
      projectType: "dormer",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.2, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Garden building — England — detached — GREEN",
    payload: {
      postcode: "OX1 2JD",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { height: 2.5, boundary: 3 }
    },
    expectedDecision: "green"
  },

  {
    name: "Garden building — Scotland — conservation override — RED",
    payload: {
      postcode: "AB10 1AA",
      propertyType: "Detached",
      projectType: "garden-outbuilding",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { height: 2.4, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Porch — semi-detached — England — GREEN",
    payload: {
      postcode: "CV1 2AB",
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
      postcode: "G1 2AB",
      propertyType: "Semi-detached",
      projectType: "front-porch",
      areaStatus: "conservation",
      propertyStatus: "none",
      dimensions: { projection: 1.5, height: 2.5, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Annexe — semi-detached — England — RED",
    payload: {
      postcode: "DA1 4AB",
      propertyType: "Semi-detached",
      projectType: "annexe",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 4, height: 3.5, boundary: 3 }
    },
    expectedDecision: "red"
  },

  {
    name: "Annexe — Scotland — RED",
    payload: {
      postcode: "DD1 5AB",
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
      postcode: "IV2 3AB",
      propertyType: "Semi-detached",
      projectType: "rear-extension",
      areaStatus: "not_sure",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 2.5 }
    },
    expectedDecision: "amber"
  },

  {
    name: "Rear extension — flat — England — RED",
    payload: {
      postcode: "EC1A 1BB",
      propertyType: "Flat",
      projectType: "rear-extension",
      areaStatus: "none",
      propertyStatus: "none",
      dimensions: { projection: 3, height: 3, boundary: 3 }
    },
    expectedDecision: "red"
  }

];