// ==========================================================
// Helper: Element selector
// ==========================================================
function $(id) {
  return document.getElementById(id);
}

// ==========================================================
// Dynamic dimension fields
// ==========================================================
const projectTypeSelect = $("projectType");
const dimensionFields = $("dimension-fields");

projectTypeSelect.addEventListener("change", () => {
  const type = projectTypeSelect.value;

  let html = "";

  if (["rear-extension", "side-extension", "wrap-extension", "two-storey"].includes(type)) {
    html = `
      <label>Projection (m)</label>
      <input id="projection" type="number" step="0.1">

      <label>Height (m)</label>
      <input id="height" type="number" step="0.1">

      <label>Distance to boundary (m)</label>
      <input id="boundary" type="number" step="0.1">
    `;
  }

  if (type === "garden-outbuilding") {
    html = `
      <label>Height (m)</label>
      <input id="height" type="number" step="0.1">

      <label>Distance to boundary (m)</label>
      <input id="boundary" type="number" step="0.1">
    `;
  }

  dimensionFields.innerHTML = html;
});

// ==========================================================
// Click handler for the main check button
// ==========================================================
$("submitBtn").addEventListener("click", runAssessment);

// ==========================================================
// Core assessment request
// ==========================================================
async function runAssessment() {
  const postcode = $("postcode").value.trim();
  const propertyType = $("propertyType").value;
  const projectType = $("projectType").value;
  const areaStatus = $("areaStatus").value;

  if (!postcode || !propertyType || !projectType) {
    alert("Please complete all required fields.");
    return;
  }

  // Collect dimension inputs safely
  const dims = {};
  if ($("projection")) dims.projection = Number($("projection").value);
  if ($("height")) dims.height = Number($("height").value);
  if ($("boundary")) dims.boundary = Number($("boundary").value);

  const payload = {
    postcode,
    propertyType,
    projectType,
    areaStatus,
    dimensions: dims
  };

  try {
    const res = await fetch("https://walker-planning-worker-dev.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      alert("Server error: " + data.error);
      return;
    }

    renderResult(data);

  } catch (err) {
    console.error("UI ERROR:", err);
    alert("A network or server error occurred.");
  }
}

// ==========================================================
// Render output into the UI (MATCHES your HTML IDs)
// ==========================================================
function renderResult(data) {
  const resultCard = $("result-card");
  if (resultCard) resultCard.classList.remove("hidden");

  // Banner behaviour
  const banner = $("result-banner");
  const decision = data.decision || "amber";

  let color = "#F7C948";      // amber
  if (decision === "green") color = "#4CAF50";
  if (decision === "red") color = "#E57373";

  if (banner) {
    banner.style.background = color;
    banner.innerText = data.decision_label || "";
  }

  // Summary text
  const summary = $("summary-text");
  if (summary) summary.innerText = data.summary || "";

  // Positives list
  const posList = $("positive-list");
  if (posList) {
    posList.innerHTML = data.positive?.length
      ? data.positive.map(p => `<li>${p}</li>`).join("")
      : `<li>No specific positive factors identified.</li>`;
  }

  // Risks list
  const riskList = $("risk-list");
  if (riskList) {
    riskList.innerHTML = data.keyRisks?.length
      ? data.keyRisks.map(r => `<li>${r}</li>`).join("")
      : `<li>No significant risks identified.</li>`;
  }

  // Professional assessment
  const assess = $("assessment-text");
  if (assess) assess.innerText =
    data.professionalAssessment ||
    "A planning officer should review this proposal.";
}