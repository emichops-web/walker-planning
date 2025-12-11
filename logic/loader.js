// logic/loader.js
import { applyEnglandWalesRules } from "./regions/england-wales.js";
import { applyScotlandRules } from "./regions/scotland.js";

export function loadRegionRules(nation) {
  if (!nation) throw new Error("Nation is required");

  nation = nation.toLowerCase();

  if (nation.includes("england") || nation.includes("wales")) {
    return applyEnglandWalesRules;
  }
  if (nation.includes("scotland")) {
    return applyScotlandRules;
  }

  throw new Error(`Unsupported nation: ${nation}`);
}