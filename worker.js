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

      // Same postcode.io logic here ...

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
