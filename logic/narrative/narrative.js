// logic/narrative/narrative.js
import { generateGreenNarrative } from "./narrative-green.js";
import { generateAmberNarrative } from "./narrative-amber.js";
import { generateRedNarrative } from "./narrative-red.js";

export function generateNarrative({ result, inputs, town, authority }) {
  const readableType = (inputs.projectType || "")
    .replace(/[-_]/g, " ")
    .toLowerCase();

  const proj = inputs.dimensions?.projection || null;
  const height = inputs.dimensions?.height || null;
  const boundary = inputs.dimensions?.boundary || null;

  // ------------------------------------------------
  // 1. INTRO
  // ------------------------------------------------
  const intro = `You requested guidance on whether proposed works to your property in ${town}, within ${authority}, can proceed under permitted development.`;

  // ------------------------------------------------
  // 2. PROJECT SUMMARY
  // ------------------------------------------------
  const project_summary =
    `You are proposing a **${readableType}**` +
    (proj ? ` with a projection of **${proj}m**` : "") +
    (height ? ` and height of **${height}m**` : "") +
    (boundary ? `, located **${boundary}m** from the nearest boundary.` : ".");

  // ------------------------------------------------
  // 3. DECISION-SPECIFIC COMPONENTS
  // ------------------------------------------------
  let detail;

  if (result.decision === "green") detail = generateGreenNarrative(inputs, result);
  else if (result.decision === "amber") detail = generateAmberNarrative(inputs, result);
  else detail = generateRedNarrative(inputs, result);

  // ------------------------------------------------
  // 4. REASONS (from rule engine)
  // ------------------------------------------------
  const reasons =
    result.risks.length > 0
      ? result.risks
      : ["No significant conflicts with permitted development thresholds were detected."];

  return {
    intro,
    project_summary,
    pd_context: detail.pd_context,
    reasons,
    recommendations: detail.recommendations,
    conclusion: detail.conclusion,
  };
}
