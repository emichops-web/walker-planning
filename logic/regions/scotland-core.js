// logic/regions/scotland-core.js
// -------------------------------------------------------------
// Scotland PD Core Rule Engine (National Rules Only)
// -------------------------------------------------------------

export function applyScotlandCoreRules(ctx) {
  let { type, prop, proj, height, boundary, designation, listed, userArea } = ctx;

  // ---------------------------------------------------------
  // BASE SCORE
  // ---------------------------------------------------------
  ctx.result.score = 68; // Default Scotland baseline

  // Property type adjustments
  if (prop === "detached") ctx.result.score += 8;
  else if (prop === "semi-detached") ctx.result.score += 4;
  else if (prop === "terraced") ctx.result.score -= 10;

  // ---------------------------------------------------------
  // LISTED BUILDINGS — always require planning
  // ---------------------------------------------------------
  if (listed === "yes") {
    ctx.result.score = 15;
    ctx.addRisk(
      "Listed buildings require planning permission for almost all external works."
    );
  }

  // ---------------------------------------------------------
  // FLATS never have PD for extensions or outbuildings
  // ---------------------------------------------------------
  const extensionTypes = [
    "rear-extension",
    "side-extension",
    "wrap-extension",
    "two-storey",
    "front-porch",
    "dormer",
    "garden-outbuilding"
  ];

  if (prop === "flat" && extensionTypes.includes(type)) {
    ctx.result.score = 15;
    ctx.addRisk("Flats do not have permitted development rights for extensions or outbuildings.");
  }

  // ---------------------------------------------------------
  // DESIGNATION IMPACT
  // ---------------------------------------------------------
  if (designation !== "none") {
    ctx.result.score -= 35;
    ctx.addRisk("The site lies in a designated area where PD rights are restricted.");
  }

  // ---------------------------------------------------------
  // SPECIAL AREA EXTENSION BAN (as per original worker)
  // ---------------------------------------------------------
  if (
    designation !== "none" &&
    ["rear-extension", "side-extension", "wrap-extension"].includes(type) &&
    ["detached", "semi-detached", "terraced"].includes(prop)
  ) {
    ctx.result.score = 15;
    ctx.addRisk("Extensions in designated areas normally require planning permission.");
  }

  // ---------------------------------------------------------
  // CONSERVATION OVERRIDES
  // ---------------------------------------------------------
  const consRestricted = [
    "rear-extension", "side-extension", "wrap-extension",
    "two-storey", "front-porch", "dormer", "annexe", "garden-outbuilding"
  ];

  if (designation === "conservation" && consRestricted.includes(type)) {
    ctx.result.score = 15;
  }

  // ---------------------------------------------------------
  // NATIONAL PARK OVERRIDES
  // ---------------------------------------------------------
  if (designation === "national_park") {
    if (["rear-extension", "dormer", "loft"].includes(type)) {
      ctx.result.score = 15;
    }
  }

  // ---------------------------------------------------------
  // HEIGHT & PROJECTION RULES
  // ---------------------------------------------------------
  if (proj > 8 || height > 6) {
    ctx.result.score = 15;
    ctx.addRisk("Project exceeds typical permitted development thresholds.");
  }

  if (type === "rear-extension" && proj > 3) {
    ctx.result.score = 15;
    ctx.addRisk("Rear extensions over 3m are not permitted development in Scotland.");
  }

  if (type === "side-extension" && proj > 3) {
    ctx.result.score = 15;
    ctx.addRisk("Side extensions over 3m are not permitted development in Scotland.");
  }

  if (type === "wrap-extension" && proj > 3) {
    ctx.result.score = 15;
    ctx.addRisk("Wrap extensions over 3m require planning permission.");
  }

  // ---------------------------------------------------------
  // BOUNDARY RULE
  // ---------------------------------------------------------
  if (type !== "garage" && boundary < 2) {
    ctx.result.score -= 20;
    ctx.addRisk("Distance to boundary is under 2m, increasing planning sensitivity.");
  }

  // ---------------------------------------------------------
  // AMBER CAP (national UX rule)
  // ---------------------------------------------------------
  if (userArea === "not_sure" && ctx.result.score >= 40) {
    ctx.result.score = Math.min(ctx.result.score, 55);
  }
}
