// ------------------------------
// Dynamic Dimension Fields
// ------------------------------

const dimensionFields = document.getElementById("dimensionFields");
const projectTypeSelect = document.getElementById("projectType");

const fieldTemplates = {
  projection: `<div><label>Projection (m) *</label><input type="number" id="projection" step="0.1" min="0"></div>`,
  height: `<div><label>Height (m) *</label><input type="number" id="height" step="0.1" min="0"></div>`,
  boundary: `<div><label>Distance to nearest boundary (m) *</label><input type="number" id="boundaryDistance" step="0.1" min="0"></div>`,
  dormerProjection: `<div><label>Dormer projection (m) *</label><input type="number" id="dormerProjection" step="0.1" min="0"></div>`,
  roofIncrease: `<div><label>Roof height increase (m) *</label><input type="number" id="roofIncrease" step="0.1" min="0"></div>`,
  footprint: `<div><label>Footprint (sqm) *</label><input type="number" id="footprint" step="0.1" min="0"></div>`
};

// Map project → required fields
const projectFieldMap = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["projection", "height", "boundary"],
  "Wrap-around extension": ["projection", "height", "boundary"],

  "Two-storey extension": ["height"],

  "Porch / front extension": ["projection"],

  "Loft dormer extension": ["height", "dormerProjection"],
  "Hip-to-gable loft conversion": ["height"],
  "Roof lights / skylights": ["height"],
  "Raising roof height": ["roofIncrease"],

  "Garden room": ["footprint", "height", "boundary"],
  "Single-storey outbuilding": ["footprint", "height", "boundary"],
  "Garage conversion": [],

  "Windows / larger windows": [],
  "Bi-fold / sliding doors": [],
  "Replace cladding": [],

  "Solar panels (roof)": ["projection"],
  "Solar panels (garden)": ["footprint", "height"],

  "Air-source heat pump": ["boundary"],
  "Chimney / flue": ["height"],
  "Fencing / gates": ["height"]
};

// When project type changes, update dimension fields
projectTypeSelect.addEventListener("change", () => {
  dimensionFields.innerHTML = "";
  const selected = projectTypeSelect.value;
  const fields = projectFieldMap[selected] || [];

  fields.forEach(f => dimensionFields.insertAdjacentHTML("beforeend", fieldTemplates[f]));
});

// ------------------------------
// Form Submission
// ------------------------------

document.getElementById("planningForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const loading = `<p style="color:#666;">Analysing…</p>`;
  document.getElementById("resultContent").innerHTML = loading;

  const payload = {
    postcode: document.getElementById("postcode").value,
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    constraints: document.getElementById("constraints").value,

    projection: document.getElementById("projection")?.value || null,
    height: document.getElementById("height")?.value || null,
    boundaryDistance: document.getElementById("boundaryDistance")?.value || null,
    dormerProjection: document.getElementById("dormerProjection")?.value || null,
    roofIncrease: document.getElementById("roofIncrease")?.value || null,
    footprint: document.getElementById("footprint")?.value || null
  };

  const response = await fetch(
    "https://walker-planning-worker.emichops.workers.dev",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();

  if (result.error) {
    document.getElementById("resultContent").innerHTML = `<p style="color:red;">${result.error}</p>`;
    return;
  }

  document.getElementById("resultContent").innerHTML =
    result.conclusion_html + result.summary_html + result.details_html;
});
