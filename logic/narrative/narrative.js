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
  };
}