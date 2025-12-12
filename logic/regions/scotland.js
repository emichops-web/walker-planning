// logic/regions/scotland.js
import { applyScotlandCoreRules } from "./scotland-core.js";
import { applyStirlingOverrides } from "./stirling-overrides.js";
import { finaliseDecision } from "../core/rules-core.js";

export function evaluateScotland(ctx) {
  // National core rules
  applyScotlandCoreRules(ctx);

  // Stirling overrides (safe, restrictive only)
  if (ctx.authority && ctx.authority.toLowerCase().includes("stirling")) {
    applyStirlingOverrides(ctx);
  }

  // Finalise score → decision (red/amber/green)
  return finaliseDecision(ctx);
}
