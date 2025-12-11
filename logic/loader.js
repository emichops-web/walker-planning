/**
 * loader.js
 * ------------------------------
 * Loads the correct regional logic module (Scotland / England/Wales)
 * based on postcode → nation.
 */

import { determineNation } from "./core/helpers.js";
import * as scotland from "./regions/scotland.js";
import * as englandWales from "./regions/england-wales.js";

export function evaluateRequest(data) {
  const nation = determineNation(data.postcode);

  if (nation === "Scotland") {
    return scotland.evaluateScottishPD(data);
  } else {
    return englandWales.evaluateEnglandWalesPD(data);
  }
}
