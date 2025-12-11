/**
 * helpers.js
 * ------------------------------
 * Shared utility functions.
 */

export function normaliseProjectType(t) {
  return (t || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
}

export function normalisePropertyType(raw) {
  const r = (raw || "").toLowerCase().trim();
  if (r.includes("flat")) return "flat";
  if (r.includes("terrace")) return "terraced";
  if (r.includes("semi")) return "semi-detached";
  if (r.includes("detached")) return "detached";
  return "other";
}

export function determineNation(postcode) {
  const pc = (postcode || "").toUpperCase().replace(/\s+/g, "");
  const scot = ["AB","DD","DG","EH","FK","G","HS","IV","KA","KW","KY","ML","PA","PH","TD","ZE"];
  return scot.some(p => pc.startsWith(p)) ? "Scotland" : "England/Wales";
}
