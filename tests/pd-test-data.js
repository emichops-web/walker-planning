// tests/pd-test-data.js

export const scenarios = [
  {
    name: "Quick Test — Rear extension 3m detached",
    postcode: "FK7 8LJ",
    projectType: "rear-extension",
    inputs: { projection: 3, height: 3, boundary: 3 },
    expectedScoreMin: 85,
    expectedScoreMax: 95,
    expectedDecision: "Likely PD"
  }
];