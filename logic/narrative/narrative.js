// logic/narrative/narrative.js
//
// Phase 2 – Unified Narrative Generator
// --------------------------------------
// Takes:
//   • final rule decision (green/amber/red)
//   • risks, positives, score, designation
//   • raw input (dimensions, types, property)
//
// Produces:
//   • intro
//   • project summary
//   • PD context
//   • reasons
//   • recommendations
//   • conclusion
//

export function generateNarrative({ result, inputs, town, authority }) {
  const { decision, risks, positive } = result;

  const readableType = (inputs.projectType || "")
    .replace(/[-_]/g, " ")
    .toLowerCase();

  const proj = inputs.dimensions?.projection || null;
  const height = inputs.dimensions?.height || null;
  const boundary = inputs.dimensions?.boundary || null;

  // --------------------------------------------
  // INTRO
  // --------------------------------------------
  const intro = `You requested guidance on whether work to your property in ${town}, within ${authority}, can proceed under permitted development. This assessment reflects current legislation and typical council interpretation.`;

  // --------------------------------------------
  // PROJECT SUMMARY
  // --------------------------------------------
  const project_summary =
    `You are proposing a **${readableType}**` +
    (proj ? ` with a projection of **${proj}m**` : "") +
    (height ? ` and height of **${height}m**` : "") +
    (boundary ? `, located **${boundary}m** from the nearest boundary.` : ".");

  // --------------------------------------------
  // PD CONTEXT
  // --------------------------------------------
  let pd_context = "";
  if (decision === "green") {
    pd_context =
      "Under permitted development rules, this type of work can often proceed without requiring a planning application, provided detailed conditions are met.";
  } else if (decision === "amber") {
    pd_context =
      "Some elements of your proposal sit close to key thresholds or within areas where interpretation varies, making further review advisable.";
  } else {
    pd_context =
      "Based on the submitted details, this proposal exceeds permitted development limits and is likely to require planning permission.";
  }

  // --------------------------------------------
  // REASONS
  // --------------------------------------------
  const reasons = risks.length
    ? risks
    : ["No major conflicts with core permitted development thresholds were identified."];

  // --------------------------------------------
  // RECOMMENDATIONS
  // --------------------------------------------
  let recommendations = [];
  if (decision === "green") {
    recommendations = [
      "Proceed under permitted development, ensuring compliance with detailed criteria.",
      "Consider applying for a Lawful Development Certificate for formal confirmation.",
    ];
  } else if (decision === "amber") {
    recommendations = [
      "Seek professional verification or refine dimensions.",
      "A Lawful Development Certificate is recommended before commencing work.",
    ];
  } else {
    recommendations = [
      "A full planning application will be required.",
      "Consider discussing design adjustments with a planning professional.",
    ];
  }

  // --------------------------------------------
  // CONCLUSION
  // --------------------------------------------
  let conclusion = "";
  if (decision === "green") {
    conclusion =
      "Overall, your project appears suitable for permitted development, subject to detailed compliance.";
  } else if (decision === "amber") {
    conclusion =
      "Your project sits close to PD limits, and further professional assessment is advised.";
  } else {
    conclusion =
      "Your proposal exceeds permitted development thresholds and is likely to require full planning permission.";
  }

  return {
    intro,
    project_summary,
    pd_context,
    reasons,
    recommendations,
    conclusion,
  };
}
