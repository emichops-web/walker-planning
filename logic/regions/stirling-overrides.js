// logic/regions/stirling-overrides.js
// -------------------------------------------------------------
// Stirling Council Specific Overrides (Safe, Non-Relaxing)
// -------------------------------------------------------------

export function applyStirlingOverrides(ctx) {
  const { type, prop, designation } = ctx;

  // Extra caution for two-storey extensions in Stirling
  if (type === "two-storey") {
    ctx.addRisk("Two-storey extensions often require additional scrutiny in Stirling.");
    ctx.result.score = Math.min(ctx.result.score, 35); // force RED
  }

  // Stirling conservation areas are interpreted more strictly
  if (designation === "conservation") {
    ctx.addRisk("Stirling conservation areas apply stricter interpretation of PD rules.");
    ctx.result.score = Math.min(ctx.result.score, 35);
  }

  // Annexe nearly always requires planning in Stirling
  if (type === "annexe") {
    ctx.addRisk("Annexes in Stirling typically require full planning permission.");
    ctx.result.score = Math.min(ctx.result.score, 35);
  }

  // Wrap extensions are very rarely PD
  if (type === "wrap-extension") {
    ctx.addRisk("Wrap-around extensions typically exceed Stirling PD thresholds.");
    ctx.result.score = Math.min(ctx.result.score, 35);
  }

  // Height > 4m triggers strong caution in Stirling outbuildings
  if (type === "garden-outbuilding" && ctx.dims.height > 4) {
    ctx.addRisk("Outbuildings over 4m are unlikely to qualify as PD in Stirling.");
    ctx.result.score = Math.min(ctx.result.score, 35);
  }
}
