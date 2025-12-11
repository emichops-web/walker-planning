/**
 * england-wales.js
 * ------------------------------
 * Logic specific to England & Wales PD rules.
 */

import { normaliseProjectType, normalisePropertyType } from "../core/helpers.js";
import { extensionTypes, baseScore } from "../core/rules-core.js";
import { scoreToDecision } from "../core/evaluate.js";

export function evaluateEnglandWalesPD(data) {
  const type = normaliseProjectType(data.projectType);
  const prop = normalisePropertyType(data.propertyType);
  const dims = data.dimensions || {};

  let score = baseScore("England/Wales");
  let risks = [];

  // Example: flats always need planning for extensions
  if (prop === "flat" && extensionTypes.includes(type)) {
    return {
      decision: "red",
      score,
      risks: ["Flats do not have PD rights for extensions."]
    };
  }

  return {
    decision: scoreToDecision(score),
    score,
    risks
  };
}
