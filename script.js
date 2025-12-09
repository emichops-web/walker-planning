// ------------------------------------------------------
// CONFIG — DEV OR PRODUCTION WORKER
// ------------------------------------------------------
const workerURL = "https://walker-planning-worker-dev.emichops.workers.dev/";
// For production: 
// const workerURL = "https://walker-planning-worker.emichops.workers.dev/";

// ------------------------------------------------------
// MAIN SCRIPT
// ------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const projectType = document.getElementById("projectType");
  const dimFields = document.getElementById("dimension-fields");
  const checkBtn = document.getElementById("checkBtn");

  projectType.addEventListener("change", renderDimensions);
  checkBtn.addEventListener("click", runCheck);

  function renderDimensions() {
    const type = projectType.value;
    let html = "";

    const needsDims = {
      "rear-extension": true,
      "side-extension": true,
      "wrap-extension": true,
      "two-storey": true,
      "garden-outbuilding": true
    };

    if (needsDims[type]) {
      html = `
        <label>Projection (metres)</label>
        <input type="number" id="projection" min="0" step="0.1">

        <label>Height (metres)</label>
        <input type="number" id="height" min="0" step="0.1">

        <label>Distance to boundary (metres)</label>
        <input type="number" id="boundary" min="0" step="0.1">
      `;
    }

    dimFields.innerHTML = html;
  }

  async function runCheck() {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const projectTypeVal = projectType.value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value === "yes";

    // Validate postcode
    const pcValid = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
    if (!pcValid.test(postcode)) {
      alert("Please enter a valid UK postcode.");
      return;
    }

    if (!propertyType || !projectTypeVal) {
      alert("Please complete all required fields.");
      return;
    }

    let dimensions = {};
    if (document.getElementById("projection")) {
      dimensions = {
        projection: Number(document.getElementById("projection").value),
        height: Number(document.getElementById("height").value),
        boundary: Number(document.getElementById("boundary").value)
      };

      if (!dimensions.projection || !dimensions.height || !dimensions.boundary) {
        alert("Please complete all dimension fields.");
        return;
      }
    }

    const payload = {
      postcode,
      propertyType,
      projectType: projectTypeVal,
      areaStatus,
      listed,
      dimensions
    };

    const res = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    renderResults(json);
  }

  function renderResults(data) {
    const pill = document.getElementById("decisionPill");
    const title = document.getElementById("resultTitle");
    const summary = document.getElementById("resultSummary");
    const riskBlock = document.getElementById("risksBlock");
    const posBlock = document.getElementById("positivesBlock");
    const professional = document.getElementById("professionalAssessment");
    const recs = document.getElementById("recommendations");

    pill.innerHTML = `<span class="pill ${data.decision}">${data.decision_label}</span>`;
    summary.textContent = data.summary;
    professional.textContent = data.professionalAssessment;

    riskBlock.innerHTML = data.keyRisks?.length
      ? `<h3>Key Risks</h3><ul>${data.keyRisks.map(r => `<li>${r}</li>`).join("")}</ul>`
      : "";

    posBlock.innerHTML = data.positive?.length
      ? `<h3>Positive Findings</h3><ul>${data.positive.map(p => `<li>${p}</li>`).join("")}</ul>`
      : "";

    recs.textContent =
      data.decision === "green"
        ? "You can likely proceed under permitted development. Confirm measurements and keep written evidence."
        : data.decision === "amber"
        ? "Consider reducing size, adjusting siting, or seeking early advice from a planning officer."
        : "Prepare for a planning application. A planner can advise on drawings, justifications, and possible design changes.";

    const card = document.getElementById("resultsCard");
    card.style.display = "block";
    card.scrollIntoView({ behavior: "smooth" });
  }
});