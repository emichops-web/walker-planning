// logic/core/helpers.js

// -----------------------------------------------------
// Text Normalisation
// -----------------------------------------------------
export function normaliseText(str) {
    if (!str) return "";
    return String(str).trim().toLowerCase();
  }
  
  // Convert project types: "rear_extension" → "rear-extension"
  export function normaliseProjectType(str) {
    if (!str) return "";
    return normaliseText(str)
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  }
  
  // Convert property types: "Detached house" → "detached"
  export function normalisePropertyType(str) {
    if (!str) return "other";
    const raw = normaliseText(str);
  
    if (raw.includes("detached") && !raw.includes("semi")) return "detached";
    if (raw.includes("semi")) return "semi-detached";
    if (raw.includes("terrace")) return "terraced";
    if (raw.includes("flat")) return "flat";
  
    return "other";
  }
  
  // Convert dimension values into safe numbers
  export function toNumber(v, fallback = 0) {
    const n = Number(v);
    return isNaN(n) ? fallback : n;
  }
  
  // Simple clamping utility
  export function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }