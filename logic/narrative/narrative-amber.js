// logic/narrative/narrative-amber.js

export function generateAmberNarrative(inputs, result) {
  return {
    pd_context:
      "Your proposal sits close to key permitted development thresholds or involves site factors that introduce uncertainty.",

    recommendations: [
      "A planning professional should review detailed drawings and measurements.",
      "Consider reducing projection/height or adjusting boundary distance.",
      "A Lawful Development Certificate is recommended before proceeding.",
    ],

    conclusion:
      "This proposal is borderline and further professional assessment is advised before progressing."
  };
}
