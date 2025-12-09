// ------------------------------------------------------
// Helper: Select DOM element safely
// ------------------------------------------------------
function $(id) {
  return document.getElementById(id);
}

// ------------------------------------------------------
// ENDPOINT SELECTION (dev vs production)
// ------------------------------------------------------
let API_ENDPOINT;

const host = window.location.hostname;

// Dev / preview environments
if (
  host.includes("localhost") ||
  host.includes("127.0.0.1") ||
  host.includes("pages.dev")
) {
  API_ENDPOINT = "https://walker-planning-worker-dev.emichops.workers.dev/";
}
// Production domain
else if (host.includes("walkerplanning.co.uk")) {
  API_ENDPOINT = "https://walker-planning-worker.emichops.workers.dev/api";
}
// Fallback
else {
  API_ENDPOINT = "https://walker-planning-worker.emichops.workers.dev/api";
}

// ------------------------------------------------------
// DYNAMIC DIMENSION FIELDS
// ------------------------------------------------------
const projectTypeEl = $("projectType");
const dimensionFields = $("dimension-fields");

const requiresDims = [
  "rear-extension",
  "side-extension",
  "wrap-extension",
  "two-storey",
  "garden-outbuilding",
  "dormer"
];

// Render dimension fields based on project type
function renderDimensionFields() {
  if (!projectTypeEl || !dimensionFields) return;

  const type = projectTypeEl.value;

  if (!requiresDims.includes(type)) {
    dimensionFields.innerHTML = "";
    return;
  }

  dimensionFields.innerHTML = `
      <label>Projection (m)</label>
      <input id="projection" type="number" step="0.1" />

      <label>Height (m)</label>
      <input id="height" type="number" step="0.1" />

      <label>Nearest boundary distance (m)</label>
      <input id="boundary" type="number" step="0.1" />
  `;
}

if (projectTypeEl) {
  projectTypeEl.addEventListener("change", renderDimensionFields);
  renderDimensionFields(); // initial
}

// ------------------------------------------------------
// HANDLE SUBMIT
// ------------------------------------------------------
const runBtn = $("runCheck");
const resultBox = $("result-box");

async function runAssessment() {
  try {
    if (!runBtn) return;

    runBtn.disabled = true;
    runBtn.innerText = "Checking...";

    // ------------------------------------------------------
    // Build request payload
    // ------------------------------------------------------
    const payload = {
      postcode: $("postcode")?.value || "",
      propertyType: $("propertyType")?.value || "",
      projectType: $("projectType")?.value || "",
      areaStatus: $("areaStatus")?.value || "not_sure",
      propertyStatus: $("propertyStatus")?.value || "",
      projectDescription: $("description")?.value || "",
      dimensions: {}
    };

    // Only include dims if present
    const projEl = $("projection");
    const heightEl = $("height");
    const boundaryEl = $("boundary");

    if (projEl) payload.dimensions.projection = parseFloat(projEl.value) || 0;
    if (heightEl) payload.dimensions.height = parseFloat(heightEl.value) || 0;
    if (boundaryEl) payload.dimensions.boundary = parseFloat(boundaryEl.value) || 0;

    // ------------------------------------------------------
    // Send API request
    // ------------------------------------------------------
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("API returned " + res.status);
    }

    const data = await res.json();

    // ------------------------------------------------------
    // Render Result
    // ------------------------------------------------------
    renderResult(data);

  } catch (err) {
    console.error(err);
    alert("Error contacting the assessment service.");
  } finally {
    runBtn.disabled = false;
    runBtn.innerText = "Run Feasibility Check";
  }
}

// ------------------------------------------------------
// RENDER RESULT CARD
// ------------------------------------------------------
function renderResult(data) {
  if (!resultBox) return;

  const {
    decision = "amber",
    decision_label = "",
    summary = "",
    positive = [],
    risks = [],
    professionalAssessment = "",
    nation = "",
    authority = "",
    town = ""
  } = data;

  // Badge colour
  let color = "#F7C948"; // amber
  if (decision === "green") color = "#4CAF50";
  if (decision === "red") color = "#E57373";

  resultBox.innerHTML = `
    <div style="
      background: ${color}; 
      padding: 10px 15px; 
      border-radius: 6px; 
      font-weight: bold; 
      margin-bottom: 15px;">
      ${decision_label}
    </div>

    <h3>Summary</h3>
    <p>${summary}</p>

    <h3>Positive Factors</h3>
    <ul>
      ${positive.length ? positive.map(p => `<li>${p}</li>`).join("") : "<li>No specific positive factors identified.</li>"}
    </ul>

    <h3>Key Risks</h3>
    <ul>
      ${risks.length ? risks.map(r => `<li>${r}</li>`).join("") : "<li>No specific risks identified.</li>"}
    </ul>

    <h3>Professional Assessment</h3>
    <p>${professionalAssessment || "A planning officer should review this proposal."}</p>

    <h3>Location</h3>
    <p>
      <strong>Town:</strong> ${town || "Unknown"}<br>
      <strong>Authority:</strong> ${authority || "Unknown"}<br>
      <strong>Nation:</strong> ${nation || "Unknown"}
    </p>
  `;
}

// ------------------------------------------------------
// Attach click listener
// ------------------------------------------------------
if (runBtn) {
  runBtn.addEventListener("click", runAssessment);
}