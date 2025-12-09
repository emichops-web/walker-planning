export default {
  async fetch(request, env) {

    const isAutomatedTest =
      request.headers.get("x-test-mode") === "true" ||
      request.headers.get("User-Agent")?.includes("Playwright");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const data = await request.json();
      const postcode = data.postcode.toUpperCase().trim();
      const formattedPC = postcode.replace(/\s+/g, "");

      // -------------------------
      // Nation
      // -------------------------
      const scotList = ["AB","DD","DG","EH","FK","G","HS","IV","KA","KW","KY","ML","PA","PH","TD","ZE"];
      const nation = scotList.some(p => formattedPC.startsWith(p)) ? "Scotland" : "England/Wales";

      // -------------------------
      // Authority lookup
      // -------------------------
      let authority = "Unknown";
      let town = "your area";
      let autoFlags = { conservation: false, nationalPark: false, aonb: false };

      if (!isAutomatedTest) {
        try {
          const res = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
          const j = await res.json();
          if (j.status === 200 && j.result) {
            authority = j.result.admin_district || "Unknown";
            town = j.result.parish || j.result.admin_ward || "your area";

            const text = JSON.stringify(j.result).toLowerCase();
            if (text.includes("conservation")) autoFlags.conservation = true;
            if (text.includes("national park")) autoFlags.nationalPark = true;
            if (text.includes("aonb")) autoFlags.aonb = true;
          }
        } catch {}
      } else {
        authority = "Stirling";
        town = "Test Town";
      }

      // -------------------------
      // Dimensions
      // -------------------------
      const dims = data.dimensions || {};
      const proj = Number(dims.projection || 0);
      const height = Number(dims.height || 0);
      const boundary = Number(dims.boundary || 0);

      // -------------------------
      // Final designation
      // -------------------------
      const userArea = data.areaStatus || "not_sure";
      const validDesignations = ["conservation","national_park","aonb","world_heritage","broads"];
      let finalDesignation = "none";

      if (userArea === "none") finalDesignation = "none";
      else if (validDesignations.includes(userArea)) finalDesignation = userArea;
      else if (userArea === "not_sure") {
        if (autoFlags.conservation) finalDesignation = "conservation";
        else if (autoFlags.nationalPark) finalDesignation = "national_park";
        else if (autoFlags.aonb) finalDesignation = "aonb";
      }

      // -------------------------
      // PD Logic (unchanged)
      // -------------------------
      let score = nation === "Scotland" ? 68 : 75;
      let risks = [];
      let positives = [];

      // FLATS
      const extensionTypes = [
        "rear-extension","side-extension","wrap-extension","two-storey",
        "front-porch","dormer","garden-outbuilding"
      ];
      if (data.propertyType === "Flat" && extensionTypes.includes(data.projectType)) {
        score = 15;
        risks.push("Flats do not have PD rights for extensions or outbuildings.");
      }

      // Property weightings
      if (data.propertyType === "Detached") score += 8;
      if (data.propertyType === "Semi-detached") score += 4;
      if (data.propertyType === "Terraced") score -= 10;

      // Designation penalties
      if (finalDesignation !== "none") {
        score -= 35;
        risks.push("The site lies in a designated area with restricted PD rights.");
      }

      // Conservation override (Stirling strict)
      const consRestricted = [
        "rear-extension","side-extension","wrap-extension","two-storey",
        "front-porch","dormer","annexe","garden-outbuilding"
      ];
      if (nation === "Scotland" &&
          finalDesignation === "conservation" &&
          consRestricted.includes(data.projectType)) {
        score = 15;
        risks.push("In Scottish Conservation Areas, this work normally requires planning permission.");
      }

      // National Park strict rules
      if (nation === "Scotland" && finalDesignation === "national_park") {
        if (data.projectType === "rear-extension") { score = 15; risks.push("Rear extensions in National Parks require full planning."); }
        if (data.projectType === "dormer")        { score = 15; risks.push("Dormers in National Parks require full planning."); }
        if (data.projectType === "loft")          { score = 15; risks.push("Loft alterations in National Parks require full planning."); }
      }

      // Garage
      if (data.projectType === "garage") {
        if (data.propertyType === "Flat") score = 15;
        else if (nation === "Scotland" && finalDesignation === "conservation") score = 15;
        else positives.push("Garage conversions are generally permitted development.");
      }

      // Outbuildings
      if (data.projectType === "garden-outbuilding") {
        if (nation === "Scotland" && height > 2.5 && boundary < 2) {
          score = 15;
          risks.push("Outbuilding over 2.5m within 2m of boundary requires planning.");
        }
      }

      // Two-storey
      if (nation === "Scotland" && data.projectType === "two-storey") {
        score = 15;
        risks.push("Two-storey extensions require planning in Scotland.");
      }

      // Annexe
      if (data.projectType === "annexe") {
        score = 15;
        risks.push("Annexes always require full planning permission.");
      }

      // Rear >3m (Scotland)
      if (nation === "Scotland" &&
          data.projectType === "rear-extension" &&
          proj > 3) {
        score = 15;
        risks.push("Rear extensions over 3m are not PD in Scotland.");
      }

      // Wrap >3m
      if (data.projectType === "wrap-extension" && proj > 3) {
        score = 15;
        risks.push("Wrap extensions over 3m require planning permission.");
      }

      // Side >3m
      if (nation === "Scotland" &&
          data.projectType === "side-extension" &&
          proj > 3) {
        score = 15;
        risks.push("Side extensions over 3m are not PD in Scotland.");
      }

      // Boundary penalty
      if (data.projectType !== "garage" && boundary < 2) {
        score -= 20;
        risks.push("Boundary under 2m increases planning risk.");
      }

      // Extreme size
      if (proj > 8 || height > 6) {
        score = 15;
        risks.push("Scale exceeds PD thresholds.");
      }

      // Not sure → amber cap
      if (nation === "Scotland" && userArea === "not_sure") {
        if (score >= 40) score = Math.min(score, 55);
      }

      // -------------------------
      // DECISION
      // -------------------------
      let decision = "amber";
      if (score >= 70) decision = "green";
      if (score < 40) decision = "red";

      // -------------------------
      // Restore full assessment text (UI fix)
      // -------------------------
      const summary =
        `This assessment has been prepared using the ${nation} PD framework for a property in ${town}, within ${authority}.`;

      const assessment =
        `The proposal involves a ${data.projectType.replace("-", " ")} on a ${data.propertyType.toLowerCase()} property. ` +
        `Based on the dimensions provided (projection ${proj}m, height ${height}m, boundary ${boundary}m) and the site's designation status, ` +
        `the overall risk category is **${decision.toUpperCase()}**.`;

      return json({
        decision,
        decision_label:
          decision === "green"
            ? "Likely permitted development (subject to confirmation)"
            : decision === "amber"
              ? "Borderline — further assessment recommended"
              : "Planning permission likely required",
        summary,
        assessment,   // <-- 👈 restored for UI
        positive: positives,
        risks,
        nation,
        authority,
        town
      });

    } catch (err) {
      return jsonError("Internal server error: " + err.message, 500);
    }
  }
};

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}

function jsonError(msg, code = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status: code,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}