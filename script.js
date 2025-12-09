document.addEventListener("DOMContentLoaded", () => {
  const projectTypeSelect = document.getElementById("projectType");
  const dimensionFields = document.getElementById("dimension-fields");
  const form = document.getElementById("pd-form");
  const resultBox = document.getElementById("result");

  // -----------------------------------------
  // DIMENSIONS: Show/hide depending on project
  // -----------------------------------------
  const projectNeedsDims = {
    "rear-extension": true,
    "side-extension": true,
    "wrap-extension": true,
    "two-storey": true,
    "front-porch": true,
    "garden-outbuilding": true,
    "dormer": true,
    "loft": false,
    "garage": false,
    "annexe": true
  };

  projectTypeSelect.addEventListener("change", () => {
    const type = projectTypeSelect.value;
    dimensionFields.style.display = projectNeedsDims[type] ? "block" : "none";
  });

  // ----------------------------------------------------
  // SUBMIT FORM → CALL WORKER API AND BUILD RESULT PANEL
  // ----------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    resultBox.innerHTML = "<p>Checking…</p>";

    const payload = {
      postcode: document.getElementById("postcode").value.trim(),
      propertyType: document.getElementById("propertyType").value,
      projectType: document.getElementById("projectType").value,
      areaStatus: document.getElementById("areaStatus").value,
      propertyStatus: document.getElementById("propertyStatus").value,
      description: document.getElementById("description").value.trim(),
      dimensions: {}
    };

    // only include dims when visible
    if (dimensionFields.style.display !== "none") {
      payload.dimensions = {
        projection: parseFloat(document.getElementById("projection").value) || 0,
        height: parseFloat(document.getElementById("height").value) || 0,
        boundary: parseFloat(document.getElementById("boundary").value) || 0
      };
    }

    try {
      const res = await fetch("https://api.walkerplanning.co.uk/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      console.log("Worker response:", result);

      // ----------------------------------------------------
      // DECISION BANNER
      // ----------------------------------------------------
      const banner =
        result.decision === "green"
          ? `<div class="green-banner">${result.decision_label}</div>`
          : result.decision === "amber"
          ? `<div class="amber-banner">${result.decision_label}</div>`
          : `<div class="red-banner">${result.decision_label}</div>`;

      // ----------------------------------------------------
      // POSITIVES & RISKS
      // (Worker returns: positive: [], risks: [])
      // ----------------------------------------------------
      const positivesHtml =
        result.positive && result.positive.length
          ? "<ul>" + result.positive.map((p) => `<li>${p}</li>`).join("") + "</ul>"
          : "<p>No specific positive factors identified.</p>";

      const risksHtml =
        result.risks && result.risks.length
          ? "<ul>" + result.risks.map((r) => `<li>${r}</li>`).join("") + "</ul>"
          : "<p>No specific risks identified.</p>";

      // ----------------------------------------------------
      // LOCATION
      // Worker returns: town, authority, nation
      // ----------------------------------------------------
      const town = result.town || "Unknown";
      const authority = result.authority || "Unknown";
      const nation = result.nation || "Unknown";

      // ----------------------------------------------------
      // PROFESSIONAL ASSESSMENT
      // Basic version (Option B)
      // ----------------------------------------------------
      let professionalAssessment = "";

      if (result.decision === "green") {
        professionalAssessment = "This proposal appears likely to fall under permitted development, subject to confirmation.";
      } else if (result.decision === "amber") {
        professionalAssessment = "A planning officer should review this proposal or further details may be required.";
      } else {
        professionalAssessment = "Planning permission is likely to be required for this proposal.";
      }

      // ----------------------------------------------------
      // BUILD RESULT HTML
      // ----------------------------------------------------
      resultBox.innerHTML = `
        ${banner}

        <h3>Summary</h3>
        <p>${result.summary || "No summary provided."}</p>

        <h3>Positive Factors</h3>
        ${positivesHtml}

        <h3>Key Risks</h3>
        ${risksHtml}

        <h3>Professional Assessment</h3>
        <p>${professionalAssessment}</p>

        <h3>Location</h3>
        <p><strong>Town:</strong> ${town}</p>
        <p><strong>Authority:</strong> ${authority}</p>
        <p><strong>Nation:</strong> ${nation}</p>
      `;
    } catch (err) {
      console.error(err);
      resultBox.innerHTML = `<p style="color:red;">An error occurred while processing your request.</p>`;
    }
  });
});