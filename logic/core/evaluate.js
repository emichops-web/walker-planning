/**
 * evaluate.js
 * ------------------------------
 * Shared scoring → decision converter.
 */

export function scoreToDecision(score) {
  if (score < 40) return "red";
  if (score >= 70) return "green";
  return "amber";
}
