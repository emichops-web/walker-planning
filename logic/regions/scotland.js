/**
 * scotland.js
 * ------------------------------
 * Logic specific to Scottish PD rules.
 */

import { normaliseProjectType, normalisePropertyType } from "../core/helpers.js";
import { extensionTypes, baseScore } from "../core/rules-core.js";
import { scoreToDecision } from "../core/evaluate.js";

export function evaluateScottishPD(data) {
  const type = normaliseProjectType(data.projectType);
  const prop = normalisePropertyType(data.propertyType);
  const dims = data.dimensions || {};

  let score = baseScore("Scotland");
  let risks = [];

  // Example rule: conservation areas block extensions
  if (["conservation","national_park","aonb"].includes(data.areaStatus)) {
    if (extensionTypes.includes(type)) {
      return {
        decision: "red",
        score,
        risks: ["Scottish designated areas restrict PD rights for extensions."]
      };
    }
  }

  // Boundary rule example
  if (dims.boundary < 2 && type !== "garage") {
    score -= 20;
    risks.push("Boundary is under 2m.");
  }

  return {
    decision: scoreToDecision(score),
    score,
    risks
  };
}
