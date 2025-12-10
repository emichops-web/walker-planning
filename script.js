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
    const listed = document.getElementById("listed").value;

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
        boundary: Number(document.getElementById("boundary").value),
      };
    }

    const payload = {
      postcode,
      propertyType,
      projectType: projectTypeVal,
      areaStatus,
      listedStatus: listed,
      dimensions
    };

    const res = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    renderResults(json);
  }

  function renderResults(data) {
    const resultsCard = document.getElementById("resultsCard");
    const pill = document.getElementById("decisionPill");
    const summary = document.getElementById("resultSummary");
    const professional = document.getElementById("professionalAssessment");

    pill.innerHTML = `<span class="pill ${data.decision}">${data.decision_label}</span>`;
    summary.textContent = data.summary;
    professional.textContent = data.professionalAssessment;

    // Risks
    const riskBlock = document.getElementById("risksBlock");
    riskBlock.innerHTML = data.keyRisks.map(r => `<li>${r}</li>`).join("");

    // Narrative sections
    const n = data.narrative;

    document.getElementById("narrativeIntro").innerHTML = n.intro;
    document.getElementById("narrativeProject").innerHTML = n.project_summary;
    document.getElementById("narrativeContext").innerHTML = n.pd_context;
    document.getElementById("narrativePDPath").innerHTML = n.recommendations.pd_path;
    document.getElementById("narrativePlanningPath").innerHTML = n.recommendations.planning_path;
    document.getElementById("narrativeConclusion").innerHTML = n.conclusion;

    resultsCard.style.display = "block";
    resultsCard.scrollIntoView({ behavior: "smooth" });
  }
});