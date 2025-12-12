// worker.js
import { evaluate } from "./logic/core/evaluate.js";

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

      // --- Narrative (Phase 3) -- placeholder ---
      const narrative = {
        intro: `Assessment for your property in ${town}, within ${authority}.`,
        project_summary: `Project: ${data.projectType}`,
        pd_context: "",
        reasons: result.risks,
        recommendations:
          result.decision === "green"
            ? ["Proceed under PD."]
            : result.decision === "amber"
            ? ["Further review recommended."]
            : ["Planning permission likely required."],
        conclusion:
          result.decision === "green"
            ? "Suitable for PD."
            : result.decision === "amber"
            ? "Borderline."
            : "Likely requires permission."
      };

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
      return jsonError("Internal server error: " + err.message, 500);
    }
  },
};
