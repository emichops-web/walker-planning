// logic/narrative/narrative-red.js

export function generateRedNarrative(inputs, result) {
  return {
    pd_context:
      "Under Scottish planning legislation, this proposal exceeds permitted development limits or involves constraints that prevent PD classification.",

    recommendations: [
      "A full planning application will be required.",
      "Consider revising the design to reduce scale, height, or boundary proximity.",
      "Discuss constraints with a planning officer or planning consultant.",
    ],

    conclusion:
      "Based on available information, this proposal does not meet permitted development criteria and will require planning permission."
  };
}
