// logic/core/evaluate.js
import { createContext } from "./rules-core.js";
import { evaluateScotland } from "../regions/scotland.js";
import { normaliseProjectType, normalisePropertyType, toNumber } from "./helpers.js";

export function evaluate(inputs) {
  const nation = determineNation(inputs.postcode);

  const ctx = createContext({
    nation,
    authority: inputs.authority || "",
    type: normaliseProjectType(inputs.projectType),
    prop: normalisePropertyType(inputs.propertyType),
    dims: {
      proj: toNumber(inputs.dimensions?.projection),
      height: toNumber(inputs.dimensions?.height),
      boundary: toNumber(inputs.dimensions?.boundary),
    },
    designation: inputs.finalDesignation || "none",
    listed: inputs.listedStatus || "no",
    userArea: inputs.areaStatus || "not_sure",
  });

  if (nation === "Scotland") {
    return evaluateScotland(ctx);
  }

  return {
    decision: "amber",
    score: 55,
    risks: ["England/Wales rules pending"],
    positive: []
  };
}

function determineNation(postcode) {
  if (!postcode) return "England/Wales";
  const formatted = postcode.replace(/\s+/g,"").toUpperCase();
  return [
    "AB","DD","DG","EH","FK","G","HS","IV","KA",
    "KW","KY","ML","PA","PH","TD","ZE"
  ].some(p => formatted.startsWith(p))
    ? "Scotland"
    : "England/Wales";
}
