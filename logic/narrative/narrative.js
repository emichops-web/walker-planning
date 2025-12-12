// ---------------------------------------------------------
// RISK REWRITING ENGINE (turns rule-engine risks into planner language)
// ---------------------------------------------------------

function rewriteRisk(risk, decision) {
  const r = risk.toLowerCase();

  // --- GREEN ---
  if (decision === "green") {
    return null; // Greens should show the single default line only
  }

  // --- AMBER (borderline) ---
  if (decision === "amber") {
    if (r.includes("boundary")) return "The proposal sits close to boundary-related thresholds where interpretation may vary.";
    if (r.includes("3m") || r.includes("projection")) return "Some dimensions are close to the permitted development limits for extensions.";
    if (r.includes("designation")) return "Site characteristics may influence whether PD rights apply.";
    if (r.includes("height")) return "The proposed height approaches the upper limits permitted under PD rights.";

    // Default fallback
    return "Some elements of the proposal sit close to thresholds that may affect PD compliance.";
  }

  // --- RED (fails PD) ---
  if (decision === "red") {
    if (r.includes("boundary")) return "The boundary distance is below the minimum typically required for permitted development.";
    if (r.includes("3m") || r.includes("projection")) return "The proposed projection exceeds permitted development limits in Scotland.";
    if (r.includes("designation")) return "Extensions in this type of designated area normally require planning permission.";
    if (r.includes("height")) return "The proposed height exceeds permitted development criteria.";

    // Default fallback
    return "Based on the supplied details, one or more permitted development limits have been exceeded.";
  }
}

export function generateNarrative({ result, inputs, town, authority }) {
  const { decision, risks, positive } = result;

  const readableType = (inputs.projectType || "")
    .replace(/[-_]/g, " ")
    .toLowerCase();

  const proj = inputs.dimensions?.projection || null;
  const height = inputs.dimensions?.height || null;
  const boundary = inputs.dimensions?.boundary || null;

  // OVERVIEW
  const intro =
    `You requested guidance on whether proposed works to your property in ${town}, within ${authority}, may fall under permitted development. ` +
    `This assessment reflects the relevant legislation and how such proposals are typically interpreted by planning authorities in Scotland.`;

  // PROJECT SUMMARY
  const project_summary =
    `The proposal involves a **${readableType}**` +
    (proj ? ` with an approximate projection of **${proj}m**` : "") +
    (height ? ` and a height of **${height}m**` : "") +
    (boundary ? `, positioned approximately **${boundary}m** from the nearest boundary.` : ".") +
    ` The assessment below considers the key permitted development criteria relevant to this type of work.`;

  // PD CONTEXT
  let pd_context = "";
  if (decision === "green") {
    pd_context =
      "Based on the information provided, the proposal appears capable of falling within permitted development rights. " +
      "Final confirmation would require detailed checks against full legislative criteria and site-specific constraints.";
  } else if (decision === "amber") {
    pd_context =
      "Some aspects of the proposal sit close to the thresholds that define permitted development in Scotland. " +
      "In such circumstances, interpretation can vary, and further assessment is recommended before proceeding.";
  } else {
    pd_context =
      "The details supplied indicate that the proposal exceeds one or more permitted development thresholds. " +
      "Planning permission is therefore likely to be required.";
  }

// KEY RISKS (from rule-engine → rewritten planner language)
let keyRisks = [];

if (decision === "green") {
  keyRisks = [
    "No key risks were identified that would affect permitted development status."
  ];
} else {
  keyRisks = risks
    .map(r => rewriteRisk(r, decision))
    .filter(Boolean); // drop nulls
}

  // REASONS
  const reasons = risks.length
    ? risks.map(r => r)
    : ["No conflicts were identified with the core tests that determine whether a proposal may fall within permitted development."];

  // RECOMMENDATIONS
  let recommendations = [];
  if (decision === "green") {
    recommendations = [
      "You may proceed under permitted development, subject to meeting all detailed criteria.",
      "If certainty is required, consider applying for a Lawful Development Certificate."
    ];
  } else if (decision === "amber") {
    recommendations = [
      "Seek professional verification of the proposal against detailed legislative criteria.",
      "Consider refining dimensions or design details where feasible.",
      "A Lawful Development Certificate is recommended before commencing work."
    ];
  } else {
    recommendations = [
      "A full planning application will be required for the proposed works.",
      "You may wish to review the design with a planning professional to explore alternative approaches."
    ];
  }

  // CONCLUSION
  let conclusion = "";
  if (decision === "green") {
    conclusion =
      "Overall, the proposal appears capable of falling within permitted development, subject to compliance with detailed criteria and site-specific considerations.";
  } else if (decision === "amber") {
    conclusion =
      "The proposal sits close to the limits of permitted development. Further assessment is advised before progressing.";
  } else {
    conclusion =
      "Based on the information provided, the proposal exceeds permitted development limits and is likely to require full planning permission.";
  }

  return {
    intro,
    project_summary,
    pd_context,
    reasons,
    recommendations,
    conclusion,
    keyRisks
  };
}