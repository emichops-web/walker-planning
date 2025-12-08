// tests/pd-test-data.js

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

  // Continue adding your remaining 18 scenarios…
];
