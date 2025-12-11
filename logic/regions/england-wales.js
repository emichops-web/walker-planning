// logic/regions/england-wales.js

export function evaluateEnglandWales({
  type,
  prop,
  proj,
  height,
  boundary,
  finalDesignation,
  listed,
  userArea,
}) {
  return {
    decision: "amber",
    score: 55,
    risks: ["England/Wales rules are not yet implemented."],
    positive: [],
  };
}

export function applyEnglandWalesRules(inputs) {
  return evaluateEnglandWales(inputs);
}