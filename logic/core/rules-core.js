// logic/core/rules-core.js

// This creates the shared evaluation context used by all regions.
export function createContext(input) {
  return {
    nation: input.nation,
    type: input.type,                 // project type
    prop: input.prop,                 // property type
    dims: input.dims,                 // dimensions
    designation: input.designation,   // conservation, AONB, etc.
    listed: input.listed,             // yes/no
    result: {
      score: 0,
      decision: "amber",
      reasons: [],
      risks: [],
      positive: [],
      overrides: [],
    },
    addRisk(msg) {
      this.result.risks.push(msg);
    },
    addReason(msg) {
      this.result.reasons.push(msg);
    },
    addPositive(msg) {
      this.result.positive.push(msg);
    },
    force(decision, reason = null) {
      this.result.decision = decision;
      if (reason) this.result.overrides.push(reason);
    },
  };
}

// Standard decision thresholds
export function finaliseDecision(ctx) {
  const { score } = ctx.result;

  if (score < 40) ctx.result.decision = "red";
  else if (score >= 70) ctx.result.decision = "green";
  else ctx.result.decision = "amber";

  return ctx.result;
}