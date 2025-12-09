const workerURL = "https://walker-planning-worker-dev.emichops.workers.dev/";

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
    const projectTypeVal = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value === "yes";

    // Basic postcode validation
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
        projection: Number(document.getElementById("projection").value || 0),
        height: Number(document.getElementById("height").value || 0),
        boundary: Number(document.getElementById("boundary").value || 0)
      };

      if (!dimensions.projection || !dimensions.height || !dimensions.boundary) {
        alert("Please enter all dimension fields.");
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
    const resultsCard = document.getElementById("resultsCard");
    const pill = document.getElementById("decisionPill");
    const title = document.getElementById("resultTitle");
    const summary = document.getElementById("resultSummary");

    const posBlock = document.getElementById("positivesBlock");
    const riskBlock = document.getElementById("risksBlock");
    const nextSteps = document.getElementById("recommendations");

    // Pill
    pill.innerHTML = `<span class="pill ${data.decision}">${data.decision_label}</span>`;

    title.textContent = "Result of Your Planning Assessment";
    summary.textContent = data.summary;

    // Positives
    posBlock.innerHTML = data.positive?.length
      ? `<h3>Positive Findings</h3><ul>${data.positive.map(p => `<li>${p}</li>`).join("")}</ul>`
      : "";

    // Risks
    riskBlock.innerHTML = data.keyRisks?.length
      ? `<h3>Key Risks</h3><ul>${data.keyRisks.map(r => `<li>${r}</li>`).join("")}</ul>`
      : "";

    document.getElementById("professionalAssessment").textContent =
      data.professionalAssessment;

    // Senior Planner Recommendations
    nextSteps.innerHTML =
      data.decision === "green"
        ? "You can likely proceed under permitted development. We recommend confirming measurements and keeping written evidence."
        : data.decision === "amber"
        ? "Consider reducing the size, increasing distance to boundaries, or seeking early advice from a planning officer."
        : "Prepare for a planning application. A planner can advise on drawings, justifications, and possible design changes."

    resultsCard.style.display = "block";
    resultsCard.scrollIntoView({ behavior: "smooth" });
  }
});