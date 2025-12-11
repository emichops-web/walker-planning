// -----------------------------------------------------------------------------
// Scotland PD Rule Engine
// -----------------------------------------------------------------------------
// This reproduces the *exact logic* from your current worker.js so that
// UI and API behaviour remain perfectly in sync.
// -----------------------------------------------------------------------------

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
  // --------------------------------------------
  // BASE SCORE
  // --------------------------------------------
  let score = 68;                // Scotland default baseline
  let risks = [];
  let positive = [];

  // --------------------------------------------
  // PROPERTY SCORE ADJUSTMENTS
  // --------------------------------------------
  if (prop === "detached") score += 8;
  else if (prop === "semi-detached") score += 4;
  else if (prop === "terraced") score -= 10;

  // --------------------------------------------
  // EXTENSION TYPES (PD-relevant)
  // --------------------------------------------
  const extensionTypes = [
    "rear-extension",
    "side-extension",
    "wrap-extension",
    "two-storey",
    "front-porch",
    "dormer",
    "garden-outbuilding",
  ];

  // --------------------------------------------
  // LISTED BUILDING → always planning
  // --------------------------------------------
  if (listed === "yes") {
    score = 15;
    risks.push(
      "Listed buildings require planning permission for almost all external works."
    );
  }

  // --------------------------------------------
  // FLATS never have PD rights for extensions/outbuildings
  // --------------------------------------------
  if (prop === "flat" && extensionTypes.includes(type)) {
    score = 15;
    risks.push("Flats do not have permitted development rights for extensions or outbuildings.");
  }

  // --------------------------------------------
  // DESIGNATION IMPACT
  // --------------------------------------------
  if (finalDesignation !== "none") {
    score -= 35;
    risks.push("The site lies in a designated area with restricted permitted development rights.");
  }

  // -------------------------------------------------------------------------
  // SPECIAL AREA EXTENSION BAN (found by reverse-engineering your worker)
  //
  // If Scotland + designated + property is a house + project is rear/side/wrap
  // THEN forced RED.
  // -------------------------------------------------------------------------
  if (
    finalDesignation !== "none" &&
    ["rear-extension", "side-extension", "wrap-extension"].includes(type) &&
    ["detached", "semi-detached", "terraced"].includes(prop)
  ) {
    score = 15;
    risks.push("Extensions in designated areas normally require planning permission.");
  }

  // --------------------------------------------
  // CONSERVATION AREA OVERRIDES
  // --------------------------------------------
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

  // --------------------------------------------
  // NATIONAL PARK OVERRIDES
  // --------------------------------------------
  if (finalDesignation === "national_park") {
    if (type === "rear-extension") score = 15;
    if (type === "dormer") score = 15;
    if (type === "loft") score = 15;
  }

  // --------------------------------------------
  // HEIGHT / PROJECTION RULES
  // --------------------------------------------
  if (proj > 8 || height > 6) {
    score = 15;
    risks.push("Project exceeds typical permitted development thresholds.");
  }

  if (type === "rear-extension" && proj > 3) {
    score = 15;
    risks.push("Rear extensions over 3m are not permitted development in Scotland.");
  }

  if (type === "side-extension" && proj > 3) {
    score = 15;
    risks.push("Side extensions over 3m are not permitted development in Scotland.");
  }

  if (type === "wrap-extension" && proj > 3) {
    score = 15;
    risks.push("Wrap extensions over 3m require planning permission.");
  }

  // --------------------------------------------
  // BOUNDARY RULE
  // --------------------------------------------
  if (type !== "garage" && boundary < 2) {
    score -= 20;
    risks.push("Distance to boundary is under 2m, increasing planning sensitivity.");
  }

  // --------------------------------------------
  // AMBER CAP (Scotland only, UX decision)
  // --------------------------------------------
  if (userArea === "not_sure" && score >= 40) {
    score = Math.min(score, 55);
  }

  // --------------------------------------------
  // SCORE → DECISION
  // --------------------------------------------
  let decision = "amber";
  if (score >= 70) decision = "green";
  if (score < 40) decision = "red";

  return {
    decision,
    score,
    risks,
    positive,
  };
}