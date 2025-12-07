export const scenarios = [

  // ------------------------
  // 1. SCOTLAND — LOW RISK
  // ------------------------
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

  // ------------------------
  // 2. SCOTLAND — CONSERVATION OVERRIDE (FORCE RED)
  // ------------------------
  {
    name: "Rear extension — Scottish Conservation Area — override triggers red",
    postcode: "PH2 8AA", // Known conservation pockets in Perth
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // ------------------------
  // 3. ENGLAND — LOW RISK SIDE EXTENSION
  // ------------------------
  {
    name: "Side extension — semi-detached — England — clear PD case",
    postcode: "SW1A 1AA",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2.5, height: 3, boundary: 2 },
    expectedDecision: "green"
  },

  // ------------------------
  // 4. ENGLAND — MEDIUM RISK SIDE (boundary <2m)
  // ------------------------
  {
    name: "Side extension — boundary too close — England — medium risk",
    postcode: "SW1A 2AB",
    propertyType: "Semi-detached",
    projectType: "side-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2.5, height: 3, boundary: 1 },
    expectedDecision: "amber"
  },

  // ------------------------
  // 5. SCOTLAND — TWO STOREY — ALMOST ALWAYS RED
  // ------------------------
  {
    name: "Two-storey extension — Scotland — terraced — high risk",
    postcode: "EH1 1BQ",
    propertyType: "Terraced",
    projectType: "two-storey",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 3, height: 4, boundary: 1 },
    expectedDecision: "red"
  },

  // ------------------------
  // 6. ENGLAND — BIG REAR EXTENSION REQUIRING PRIOR APPROVAL
  // ------------------------
  {
    name: "Rear extension — 5m projection — England detached — prior approval risk",
    postcode: "CM1 1AA",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 5, height: 3, boundary: 3 },
    expectedDecision: "amber"
  },

  // ------------------------
  // 7. ENGLAND — BEYOND PD LIMIT
  // ------------------------
  {
    name: "Rear extension — 9m projection — England detached — exceeds PD",
    postcode: "BR3 1AB",
    propertyType: "Detached",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 9, height: 3, boundary: 3 },
    expectedDecision: "red"
  },

  // ------------------------
  // 8. SCOTLAND — UNCERTAIN DESIGNATION AREA
  // ------------------------
  {
    name: "Rear extension — Scotland — user not sure about designation",
    postcode: "FK8 1AA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "amber"
  },

  // ------------------------
  // 9. GARAGE CONVERSION — ALMOST ALWAYS GREEN
  // ------------------------
  {
    name: "Garage conversion — detached — Scotland",
    postcode: "PH1 3AA",
    propertyType: "Detached",
    projectType: "garage",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "green"
  },

  // ------------------------
  // 10. LOFT — LOW RISK IF NO CONSERVATION
  // ------------------------
  {
    name: "Loft conversion — semi-detached — England — typical PD",
    postcode: "NG1 1AA",
    propertyType: "Semi-detached",
    projectType: "loft",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "green"
  },

  // ------------------------
  // 11. LOFT — CONSERVATION AREA IN ENGLAND — STILL POSSIBLE BUT RISKY
  // ------------------------
  {
    name: "Loft conversion — England — conservation — medium risk",
    postcode: "BA1 1AA", // Bath = conservation heavy
    propertyType: "Detached",
    projectType: "loft",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "amber"
  },

  // ------------------------
  // 12. DORMER — HIGH RISK IN CONSERVATION
  // ------------------------
  {
    name: "Dormer — Scotland — conservation override",
    postcode: "EH3 6AA",
    propertyType: "Detached",
    projectType: "dormer",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "red"
  },

  // ------------------------
  // 13. GARDEN BUILDING — LOW RISK
  // ------------------------
  {
    name: "Garden building — England — detached",
    postcode: "YO1 7AA",
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "green"
  },

  // ------------------------
  // 14. GARDEN BUILDING — SCOTLAND — CONSERVATION
  // ------------------------
  {
    name: "Garden building — Scotland — conservation override",
    postcode: "KY16 9AA", // St Andrews conservation
    propertyType: "Detached",
    projectType: "garden-outbuilding",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "red"
  },

  // ------------------------
  // 15. PORCH — LOW RISK
  // ------------------------
  {
    name: "Porch — semi-detached — England — low risk",
    postcode: "WR1 2AA",
    propertyType: "Semi-detached",
    projectType: "front-porch",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 2, height: 3, boundary: 2 },
    expectedDecision: "green"
  },

  // ------------------------
  // 16. PORCH — SCOTLAND — CONSERVATION OVERRIDE
  // ------------------------
  {
    name: "Porch — Scotland — conservation area — override red",
    postcode: "IV1 1AA",
    propertyType: "Detached",
    projectType: "front-porch",
    areaStatus: "conservation",
    propertyStatus: "none",
    inputs: { projection: 2, height: 3, boundary: 2 },
    expectedDecision: "red"
  },

  // ------------------------
  // 17. ANNEXE — USUALLY PLANNING REQUIRED
  // ------------------------
  {
    name: "Annexe — semi-detached — England — high risk",
    postcode: "LE1 1AA",
    propertyType: "Semi-detached",
    projectType: "annexe",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "red"
  },

  // ------------------------
  // 18. ANNEXE — SCOTLAND — ALSO HIGH RISK
  // ------------------------
  {
    name: "Annexe — Scotland — high risk",
    postcode: "G1 1AA",
    propertyType: "Detached",
    projectType: "annexe",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: {},
    expectedDecision: "red"
  },

  // ------------------------
  // 19. SCOTLAND — UNCERTAIN STATUS — SEMI DETACHED — REAR EXT — MEDIUM RISK
  // ------------------------
  {
    name: "Rear extension — Scotland — not sure about designation — semi-detached",
    postcode: "FK9 4AA",
    propertyType: "Semi-detached",
    projectType: "rear-extension",
    areaStatus: "not_sure",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "amber"
  },

  // ------------------------
  // 20. FLAT — ALMOST ALWAYS RED FOR EXTENSIONS
  // ------------------------
  {
    name: "Rear extension — flat — England — extensions not PD",
    postcode: "M1 1AA",
    propertyType: "Flat",
    projectType: "rear-extension",
    areaStatus: "none",
    propertyStatus: "none",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedDecision: "red"
  }

];