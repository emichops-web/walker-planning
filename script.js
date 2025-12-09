// ---------------------------------------------------------------
// CONFIG: Worker endpoint (DEV)
// ---------------------------------------------------------------
const WORKER_URL = "https://walker-planning-worker-dev.emichops.workers.dev/";

// ---------------------------------------------------------------
// DOM ELEMENTS
// ---------------------------------------------------------------
const form = document.getElementById("pd-form");
const projectType = document.getElementById("projectType");
const dimensionFields = document.getElementById("dimension-fields");
const resultSection = document.getElementById("result-section");
const checkBtn = document.getElementById("check-button");

// ---------------------------------------------------------------
// DYNAMIC DIMENSIONS BASED ON PROJECT TYPE
// ---------------------------------------------------------------
projectType.addEventListener("change", () => {
  const type = projectType.value;
  let html = "";

  const needsDims = [
    "rear-extension",
    "side-extension",
    "wrap-extension",
    "two-storey",
    "garden-outbuilding",
    "dormer"
  ];

  if (needsDims.includes(type)) {
    html += `
      <label>Projection (m)</label>
      <input id="projection" type="number" step="0.1" />

      <label>Height (m)</label>
      <input id="height" type="number" step="0.1" />

      <label>Distance to nearest boundary (m)</label>
      <input id="boundary" type="number" step="0.1" />
    `;
  }

  dimensionFields.innerHTML = html;
});

// ---------------------------------------------------------------
// HANDLE FORM SUBMIT
// ---------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  checkBtn.disabled = true;
  checkBtn.innerText = "Checking...";

  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    areaStatus: document.getElementById("areaStatus").value,
    description: document.getElementById("description").value.trim(),
    dimensions: {}
  };

  // Only include dimensions if fields exist
  const projEl = document.getElementById("projection");
  if (projEl) {
    payload.dimensions = {
      projection: parseFloat(projEl.value) || 0,
      height: parseFloat(document.getElementById("height").value) || 0,
      boundary: parseFloat(document.getElementById("boundary").value) || 0
    };
  }

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    displayResults(json);

  } catch (err) {
    alert("There was an error contacting the assessment service.");
  }

  checkBtn.disabled = false;
  checkBtn.innerText = "Check";
});

// ---------------------------------------------------------------
// RENDER RESULTS
// ---------------------------------------------------------------
function displayResults(data) {
  resultSection.style.display = "block";

  const banner = document.getElementById("decision-banner");
  banner.className = data.decision;
  banner.innerText = data.decision.toUpperCase();

  document.getElementById("decision-label").innerText = data.decision_label;
  document.getElementById("professionalAssessment").innerText = data.professionalAssessment;
  document.getElementById("summary").innerText = data.summary;

  // Positives
  const posList = document.getElementById("positive-list");
  posList.innerHTML = "";
  data.positive.forEach(p => {
    const li = document.createElement("li");
    li.innerText = p;
    posList.appendChild(li);
  });

  // Risks
  const riskList = document.getElementById("risk-list");
  riskList.innerHTML = "";
  data.keyRisks.forEach(r => {
    const li = document.createElement("li");
    li.innerText = r;
    riskList.appendChild(li);
  });

  // Location
  document.getElementById("location").innerText =
    `${data.location.town}, ${data.location.authority}, ${data.location.nation}`;

  // Reset button
  document.getElementById("new-check").onclick = () => {
    resultSection.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}