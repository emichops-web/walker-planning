// logic/core/evaluate.js
import { evaluateScotland } from "../regions/scotland.js";
import { evaluateEnglandWales } from "../regions/england-wales.js";

// -------------------------------------------------
// Normalisation helpers
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

function determineNation(pc) {
  if (!pc) return "England/Wales";
  const formatted = pc.replace(/\s+/g, "").toUpperCase();

  const scotList = ["AB","DD","DG","EH","FK","G","HS","IV","KA","KW","KY","ML","PA","PH","TD","ZE"];
  return scotList.some(p => formatted.startsWith(p))
    ? "Scotland"
    : "England/Wales";
}

// -------------------------------------------------
// MAIN EVALUATION
// -------------------------------------------------
export function evaluate(inputs) {
  const nation = determineNation(inputs.postcode);
  const type = normaliseProjectType(inputs.projectType);
  const prop = normalisePropertyType(inputs.propertyType);

  const proj = Number(inputs.dimensions?.projection || 0);
  const height = Number(inputs.dimensions?.height || 0);
  const boundary = Number(inputs.dimensions?.boundary || 0);

  const listed = inputs.listedStatus || "no";
  const userArea = inputs.areaStatus || "not_sure";
  const finalDesignation = inputs.finalDesignation || "none";

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
    result = evaluateEnglandWales({
      type,
      prop,
      proj,
      height,
      boundary,
      listed,
      userArea,
      finalDesignation,
    });
  }

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
    ...result,
  };
}