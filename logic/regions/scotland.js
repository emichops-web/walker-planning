// logic/regions/scotland.js

// CORE SCOTLAND RULE ENGINE
export function evaluateScotland({
  type,
  prop,
  proj,
  height,
  boundary,
  finalDesignation,
  listed,
  userArea,
}) {
  let score = 68;
  let risks = [];
  let positive = [];

  // --- PROPERTY ADJUSTMENTS ---
  if (prop === "detached") score += 8;
  else if (prop === "semi-detached") score += 4;
  else if (prop === "terraced") score -= 10;

  const extensionTypes = [
    "rear-extension",
    "side-extension",
    "wrap-extension",
    "two-storey",
    "front-porch",
    "dormer",
    "garden-outbuilding",
  ];

  // LISTED BUILDING
  if (listed === "yes") {
    score = 15;
    risks.push("Listed buildings require planning permission.");
  }

  // FLATS
  if (prop === "flat" && extensionTypes.includes(type)) {
    score = 15;
    risks.push("Flats do not have PD rights for extensions.");
  }

  // DESIGNATION EFFECT
  if (finalDesignation !== "none") {
    score -= 35;
    risks.push("Designated area with restricted PD rights.");
  }

  // SPECIAL AREA EXTENSION BAN
  if (
    finalDesignation !== "none" &&
    ["rear-extension", "side-extension", "wrap-extension"].includes(type) &&
    ["detached", "semi-detached", "terraced"].includes(prop)
  ) {
    score = 15;
    risks.push("Extensions in designated areas normally require planning permission.");
  }

  // CONSERVATION AREA
  const consRestricted = [
    "rear-extension",
    "side-extension",
    "wrap-extension",
    "two-storey",
    "front-porch",
    "dormer",
    "annexe",
    "garden-outbuilding",
  ];

  if (finalDesignation === "conservation" && consRestricted.includes(type)) {
    score = 15;
  }

  // NATIONAL PARK
  if (finalDesignation === "national_park") {
    if (["rear-extension","dormer","loft"].includes(type)) {
      score = 15;
    }
  }

  // HEIGHT / PROJECTION
  if (proj > 8 || height > 6) {
    score = 15;
    risks.push("Project exceeds permitted development thresholds.");
  }

  if (type === "rear-extension" && proj > 3) {
    score = 15;
  }

  if (type === "side-extension" && proj > 3) {
    score = 15;
  }

  if (type === "wrap-extension" && proj > 3) {
    score = 15;
  }

  // BOUNDARY RULE
  if (boundary < 2 && type !== "garage") {
    score -= 20;
    risks.push("Boundary is under 2m.");
  }

  // AMBER CAP
  if (userArea === "not_sure" && score >= 40) {
    score = Math.min(score, 55);
  }

  let decision = "amber";
  if (score >= 70) decision = "green";
  if (score < 40) decision = "red";

  return { decision, score, risks, positive };
}

// EXPORT WRAPPER FOR LOADER.JS
export function applyScotlandRules(inputs) {
  return evaluateScotland(inputs);
}