document.addEventListener("DOMContentLoaded", () => {

  const projectType = document.getElementById("projectType");
  const dimensionFields = document.getElementById("dimension-fields");
  const runCheckBtn = document.getElementById("runCheck");

  // ------------------------------------------------------
  // 1. Dynamic dimension fields by project type
  // ------------------------------------------------------
  function renderDimensionFields(type) {
    let html = "";

    const needsDims = [
      "rear-extension",
      "side-extension",
      "wrap-extension",
      "two-storey"
    ];

    const needsOutbuildingDims = ["garden-outbuilding"];

    if (needsDims.includes(type)) {
      html = `
        <label>Projection (m)</label>
        <input id="projection" type="number" min="0" step="0.1">

        <label>Height (m)</label>
        <input id="height" type="number" min="0" step="0.1">

        <label>Nearest boundary distance (m)</label>
        <input id="boundary" type="number" min="0" step="0.1">
      `;
    }

    if (needsOutbuildingDims.includes(type)) {
      html = `
        <label>Height (m)</label>
        <input id="height" type="number" min="0" step="0.1">

        <label>Nearest boundary distance (m)</label>
        <input id="boundary" type="number" min="0" step="0.1">
      `;
    }

    dimensionFields.innerHTML = html;
  }

  // initial call
  renderDimensionFields(projectType.value);

  projectType.addEventListener("change", () => {
    renderDimensionFields(projectType.value);
  });

  // ------------------------------------------------------
  // 2. Submit handler — calls Worker API
  // ------------------------------------------------------
  runCheckBtn.addEventListener("click", async () => {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const project = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const propertyStatus = document.getElementById("propertyStatus").value;
    const description = document.getElementById("description").value;

    // collect dims if they exist
    const projection = document.getElementById("projection")?.value || null;
    const height = document.getElementById("height")?.value || null;
    const boundary = document.getElementById("boundary")?.value || null;

    const payload = {
      postcode,
      propertyType,
      projectType: project,
      areaStatus,
      propertyStatus,
      description,
      dimensions: {
        projection: projection ? parseFloat(projection) : null,
        height: height ? parseFloat(height) : null,
        boundary: boundary ? parseFloat(boundary) : null
      }
    };

    let endpoint =
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("pages.dev")
        ? "https://walker-planning-worker-dev.emichops-web.workers.dev"
        : "https://api.walkerplanning.co.uk/api";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      renderResult(json);

    } catch (err) {
      alert("Error contacting the assessment service.");
      console.error(err);
    }
  });

  // ------------------------------------------------------
  // 3. Render result card
  // ------------------------------------------------------
  function renderResult(data) {
    const card = document.getElementById("result-card");
    const banner = document.getElementById("result-banner");
    const summaryText = document.getElementById("summary-text");
    const riskList = document.getElementById("risk-list");
    const posList = document.getElementById("positive-list");
    const assessmentText = document.getElementById("assessment-text");

    // banner colour + label
    banner.className = "result-banner";
    banner.classList.add(
      data.decision === "green"
        ? "green"
        : data.decision === "amber"
        ? "amber"
        : "red"
    );
    banner.textContent = data.decision_label;

    // summary
    summaryText.textContent = data.summary || "";

    // positive
    posList.innerHTML = "";
    (data.positive || []).forEach((p) => {
      let li = document.createElement("li");
      li.textContent = p;
      posList.appendChild(li);
    });

    // risks
    riskList.innerHTML = "";
    (data.risks || []).forEach((r) => {
      let li = document.createElement("li");
      li.textContent = r;
      riskList.appendChild(li);
    });

    // professional assessment
    assessmentText.textContent =
      data.professionalAssessment ||
      (data.decision === "green"
        ? "Your proposal appears to fall within permitted development rules."
        : data.decision === "amber"
        ? "A planning officer should review the details to confirm compliance."
        : "Planning permission is likely to be required for this proposal.");

    card.classList.remove("hidden");
  }
});