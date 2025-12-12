// worker.js
import { evaluate } from "./logic/core/evaluate.js";
import { generateNarrative } from "./logic/narrative/narrative.js";

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}

function jsonError(msg, code = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status: code,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const data = await request.json();
      const postcode = data.postcode?.toUpperCase().trim();

      // --- Lookup authority + town (unchanged) ---
      let authority = "Unknown";
      let town = "your area";
      let autoFlags = { conservation: false, aonb: false, nationalPark: false };

      try {
  const res = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
  const j = await res.json();

  if (j.status === 200 && j.result) {
    authority = j.result.admin_district || "Unknown";

    // Extract town from multiple fallback fields
    const r = j.result;
    if (r.post_town) town = r.post_town;
    else if (r.lsoa && /^[A-Za-z]+/.test(r.lsoa))
      town = r.lsoa.split(/[\s-]+/)[0];
    else if (r.msoa && /^[A-Za-z]+/.test(r.msoa))
      town = r.msoa.split(/[\s-]+/)[0];
    else if (r.parish && r.parish.length < 20) 
      town = r.parish;
    else if (r.admin_ward && r.admin_ward.length < 20) 
      town = r.admin_ward;

    // Detect special areas from text
    const text = JSON.stringify(j.result).toLowerCase();
    if (text.includes("conservation")) autoFlags.conservation = true;
    if (text.includes("aonb")) autoFlags.aonb = true;
    if (text.includes("national park")) autoFlags.nationalPark = true;
  }
} catch (err) {
  console.log("Postcode lookup failed", err);
}

      // --- Final Designation (unchanged) ---
      const userArea = data.areaStatus || "not_sure";
      let finalDesignation = "none";
      const validDesignations = ["conservation","national_park","aonb","world_heritage","broads"];
      if (validDesignations.includes(userArea)) finalDesignation = userArea;
      else if (userArea === "not_sure") {
        if (autoFlags.conservation) finalDesignation = "conservation";
        else if (autoFlags.nationalPark) finalDesignation = "national_park";
        else if (autoFlags.aonb) finalDesignation = "aonb";
      }

      // --- Run unified logic engine ---
      const result = evaluate({
        postcode: data.postcode,
        projectType: data.projectType,
        propertyType: data.propertyType,
        authority,
        dimensions: data.dimensions || {},
        listedStatus: data.listedStatus || "no",
        areaStatus: userArea,
        finalDesignation
      });

      // --- Narrative (Phase 3 actual generator) ---
      const narrative = generateNarrative({
        result,
        inputs: data,
        town,
        authority
      });

      return json({
        decision: result.decision,
        decision_label:
          result.decision === "green"
            ? "Likely permitted development"
            : result.decision === "amber"
            ? "Borderline"
            : "Planning permission likely required",
        summary: `Assessment for ${town}, within ${authority}.`,
        positive: result.positive,
        keyRisks: result.risks,
        professionalAssessment: "",
        location: { town, authority, nation: result.nation },
        narrative,
      });

    } catch (err) {
      return jsonError("Internal server error: " + err.message, 500);
    }
  },
};
