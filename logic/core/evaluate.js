// -----------------------------------------------------------------------------
// evaluate.js
//
// Phase 1: Core evaluation engine
// This file:
//   • Normalises raw inputs (property type, project type, dimensions)
//   • Determines the nation
//   • Calls the correct region rule engine (Scotland for now)
//   • Returns a clean, standardised PD evaluation result
//
// Later (Phase 2–3):
//   • Narrative generation moves to narrative.js
//   • Stirling-specific overrides live in regions/stirling.js
// -----------------------------------------------------------------------------

import { evaluateScotland } from "./regions/scotland.js";

// -------------------------------------------------
// Normalisation helpers (matches current worker.js)
// -------------------------------------------------
function normaliseProjectType(type) {
  if (!type) return "unknown";
  return type.toLowerCase().trim().replace(/_/g, "-").replace(/\s+/g, "-");
}

function normalisePropertyType(raw) {
  if (!raw) return "other";
  let t = raw.toLowerCase().replace(/\s+/g, " ").trim();

  if (t.includes("detached") && !t.includes("semi")) return "detached";
  if (t.includes("semi")) return "semi-detached";
  if (t.includes("terrace")) return "terraced";
  if (t.includes("flat")) return "flat";

  return "other";
}

// -------------------------------------------------
// Determine which nation rules apply
// (Same logic used in your worker)
// -------------------------------------------------
function determineNation(postcode) {
  if (!postcode) return "England/Wales";

  const formatted = postcode.replace(/\s+/g, "").toUpperCase();
  const scotList = [
    "AB", "DD", "DG", "EH", "FK", "G", "HS", "IV",
    "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE",
  ];

  return scotList.some(prefix => formatted.startsWith(prefix))
    ? "Scotland"
    : "England/Wales";
}

// -----------------------------------------------------------------------------
// MAIN EXPORT
// -----------------------------------------------------------------------------

export function evaluate(inputs) {
  // -------------------------------------------------
  // 1. Extract + normalise input fields
  // -------------------------------------------------
  const nation = determineNation(inputs.postcode);
  const type = normaliseProjectType(inputs.projectType);
  const prop = normalisePropertyType(inputs.propertyType);

  const proj = Number(inputs.dimensions?.projection || 0);
  const height = Number(inputs.dimensions?.height || 0);
  const boundary = Number(inputs.dimensions?.boundary || 0);

  const listed = inputs.listedStatus || "no";
  const userArea = inputs.areaStatus || "not_sure";
  const finalDesignation = inputs.finalDesignation || "none";

  // -------------------------------------------------
  // 2. Apply regional rule engine
  // -------------------------------------------------
  let result;

  if (nation === "Scotland") {
    result = evaluateScotland({
      type,
      prop,
      proj,
      height,
      boundary,
      listed,
      userArea,
      finalDesignation,
    });
  } else {
    // England/Wales placeholder (Phase 3+)
    result = {
      decision: "amber",
      score: 55,
      risks: ["England/Wales rules not yet implemented in new engine."],
      positive: [],
    };
  }

  // -------------------------------------------------
  // 3. Return standardised evaluation object
  // -------------------------------------------------
  return {
    nation,
    type,
    prop,
    proj,
    height,
    boundary,
    listed,
    userArea,
    finalDesignation,
    ...result, // { decision, score, risks, positive }
  };
}