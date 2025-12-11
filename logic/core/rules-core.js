/**
 * rules-core.js
 * ------------------------------
 * Core rule definitions shared between Scotland & England/Wales.
 */

export const extensionTypes = [
  "rear-extension",
  "side-extension",
  "wrap-extension",
  "two-storey",
  "front-porch",
  "dormer",
  "garden-outbuilding",
  "annexe"
];

export function baseScore(nation) {
  return nation === "Scotland" ? 68 : 75;
}
