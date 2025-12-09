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

  // Dynamic dimension rendering
  projectType.addEventListener("change", renderDimensions);
  checkBtn.addEventListener("click", runCheck);

  function renderDimensions() {
    const type = projectType.value;

    const needsDims = {
      "rear-extension": true,
      "side-extension": true,
      "wrap-extension": true,
      "two-storey": true,
      "garden-outbuilding": true
    };

    if (needsDims[type]) {
      dimFields.innerHTML = `
        <label>Projection (metres)</label>
        <input type="number" id="projection" min="0" step="0.1">

        <label>Height (metres)</label>
        <input type="number" id="height" min="0" step="0.1">

        <label>Distance to boundary (metres)</label>
        <input type="number" id="boundary" min="0" step="0.1">
      `;
    } else {
      dimFields.innerHTML = "";
    }
  }

  // ------------------------------------------------------
  // RUN CHECK — VALIDATION + API CALL
  // ------------------------------------------------------
  async function runCheck() {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const projectTypeVal = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value === "yes";

    // Basic UK postcode validation
    const pcValid = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
    if (!pcValid.test(postcode)) {
      alert("Please enter a valid UK postcode.");
      return;
    }

    if (!propertyType || !projectTypeVal) {
      alert("Please complete all required fields.");
      return;
    }

    // Collect dimensions if applicable
    let dimensions = {};
    const projEl = document.getElementById("projection");

    if (projEl) {
      const projection = Number(document.getElementById("projection").value || 0);
      const height = Number(document.getElementById("height").value || 0);
      const boundary = Number(document.getElementById("boundary").value || 0);

      if (!projection || !height || !boundary) {
        alert("Please enter all dimension fields.");
        return;
      }

      dimensions = { projection, height, boundary };
    }

    // Build payload
    const payload = {
      postcode,
      propertyType,
      projectType: projectTypeVal,
      areaStatus,
      listed,
      dimensions
    };

    // Call Worker
    let res;
    try {
      res = await fetch(workerURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      alert("Unable to contact assessment service.");
      return;
    }

    const json = await res.json();
    renderResults(json);
  }

  // ------------------------------------------------------
  // RENDER THE RESULTS — INCLUDING NARRATIVE
  // ------------------------------------------------------
  function renderResults(data) {
    const resultsCard = document.getElementById("resultsCard");

    // --- BIG COLOURED DECISION PILL ---
    const pill = document.getElementById("decisionPill");
    pill.innerHTML = `<span class="pill ${data.decision}">${data.decision_label}</span>`;

    // Title
    document.getElementById("resultTitle").textContent =
      "Result of Your Planning Assessment";

    // Summary (standard)
    document.getElementById("resultSummary").textContent = data.summary;

    // Professional assessment
    document.getElementById("professionalAssessment").textContent =
      data.professionalAssessment;

    // --- Narrative Sections (NEW!) ---
    const narrative = data.narrative || {};

    document.getElementById("narrativeIntro").innerHTML =
      narrative.intro ? `<p>${narrative.intro}</p>` : "";

    document.getElementById("narrativeProjectSummary").innerHTML =
      narrative.project_summary ? `<p>${narrative.project_summary}</p>` : "";

    document.getElementById("narrativePdContext").innerHTML =
      narrative.pd_context ? `<p>${narrative.pd_context}</p>` : "";

    document.getElementById("narrativeConclusion").innerHTML =
      narrative.conclusion ? `<p>${narrative.conclusion}</p>` : "";

    // --- Risks ---
    const riskBlock = document.getElementById("risksBlock");
    riskBlock.innerHTML = data.keyRisks?.length
      ? `<h3>Key Risks</h3><ul>${data.keyRisks
          .map(r => `<li>${r}</li>`)
          .join("")}</ul>`
      : "";

    // --- Positives ---
    const posBlock = document.getElementById("positivesBlock");
    posBlock.innerHTML = data.positive?.length
      ? `<h3>Positive Findings</h3><ul>${data.positive
          .map(p => `<li>${p}</li>`)
          .join("")}</ul>`
      : "";

    // --- Next Recommended Steps (narrative recommended) ---
    const nextSteps = document.getElementById("recommendations");
    nextSteps.innerHTML =
      narrative.recommendations ||
      (data.decision === "green"
        ? "You can likely proceed under permitted development. Confirm measurements remain within allowed limits."
        : data.decision === "amber"
        ? "Your proposal is borderline. Consider reducing size or adjusting siting to increase PD compliance."
        : "Planning permission is required. A planner can advise on drawings and justification.");

    // Show card + scroll
    resultsCard.style.display = "block";
    resultsCard.scrollIntoView({ behavior: "smooth" });
  }
});