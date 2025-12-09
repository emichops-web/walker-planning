// ==========================================================
// Helper: get element by ID
// ==========================================================
function $(id) {
  return document.getElementById(id);
}

// ==========================================================
// Dynamic Dimension Rendering
// ==========================================================
const projectTypeSelect = $("projectType");
const dimensionFields = $("dimension-fields");

if (projectTypeSelect) {
  projectTypeSelect.addEventListener("change", () => {
    const type = projectTypeSelect.value;
    let html = "";

    // Extension types requiring 3 fields
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

    // Outbuilding types requiring 2 fields
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
}

// ==========================================================
// ENVIRONMENT AWARE API URL
// ==========================================================
function getApiUrl() {
  const host = window.location.hostname;

  if (host.includes("result-categories")) {
    // your dev site on Cloudflare Pages
    return "https://walker-planning-worker-dev.emichops.workers.dev/";
  }

  // Production domain -> production Worker
  return "https://walker-planning-worker.emichops.workers.dev/";
}

// ==========================================================
// MAIN REQUEST HANDLER
// ==========================================================
async function runAssessment() {
  try {
    // Collect form values
    const postcode = $("postcode").value.trim();
    const propertyType = $("propertyType").value;
    const projectType = $("projectType").value;
    const areaStatus = $("areaStatus").value;

    const projection = $("projection")?.value;
    const height = $("height")?.value;
    const boundary = $("boundary")?.value;

    const dimensions = {};
    if (projection) dimensions.projection = Number(projection);
    if (height) dimensions.height = Number(height);
    if (boundary) dimensions.boundary = Number(boundary);

    const payload = {
      postcode,
      propertyType,
      projectType,
      areaStatus,
      dimensions
    };

    const api = getApiUrl();

    const response = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Bad response from assessment service");
    }

    const result = await response.json();

    renderResult(result);

  } catch (err) {
    console.error(err);
    alert("Error contacting the assessment service.");
  }
}

// ==========================================================
// RENDER ASSESSMENT RESULT INTO UI
// ==========================================================
function renderResult(data) {
  const container = $("result-container");
  if (!container) return;

  let colourClass = "amber-box";
  if (data.decision === "green") colourClass = "green-box";
  if (data.decision === "red") colourClass = "red-box";

  container.innerHTML = `
    <div class="decision-box ${colourClass}">
      ${data.decision_label}
    </div>

    <h3>Summary</h3>
    <p>${data.summary}</p>

    <h3>Positive Factors</h3>
    ${
      data.positive?.length
        ? `<ul>${data.positive.map(p => `<li>${p}</li>`).join("")}</ul>`
        : "<p>No specific positive factors identified.</p>"
    }

    <h3>Key Risks</h3>
    ${
      data.keyRisks?.length
        ? `<ul>${data.keyRisks.map(r => `<li>${r}</li>`).join("")}</ul>`
        : "<p>No specific risks identified.</p>"
    }

    <h3>Professional Assessment</h3>
    <p>${data.professionalAssessment}</p>

    <h3>Location</h3>
    <p><strong>Town:</strong> ${data.location?.town || "Unknown"}</p>
    <p><strong>Authority:</strong> ${data.location?.authority || "Unknown"}</p>
    <p><strong>Nation:</strong> ${data.location?.nation || "Unknown"}</p>
  `;
}

// ==========================================================
// BIND BUTTON CLICK
// ==========================================================
$("checkBtn").addEventListener("click", runAssessment);