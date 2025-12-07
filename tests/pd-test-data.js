export const scenarios = [

  {
    name: "Rear extension — 3m detached — Scotland — low risk",
    postcode: "PH7 4BL",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "green"
  },

  {
    name: "Rear extension — 3m detached — Scotland — conservation area override",
    postcode: "PH7 4BL",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "red" // Scottish conservation area override forces red
  },

  {
    name: "Side extension — semi-detached — England — medium risk",
    postcode: "SW1A 1AA", // England
    propertyType: "Semi-detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    expectedDecision: "green"
  },

  {
    name: "Two-storey extension — terraced — high risk",
    postcode: "EH1 1BQ",
    propertyType: "Terraced",
    projectType: "two-storey",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 3, height: 4, boundary: 1 },
    expectedDecision: "red"
  }
];