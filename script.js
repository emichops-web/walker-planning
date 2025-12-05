/* -------------------------------
  PROJECT TYPE → DIMENSION RULES
------------------------------- */
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundaryDistance"],
  "Side extension": ["width", "height", "boundaryDistance"],
  "Wrap-around extension": ["projection", "width", "height"],
  "Porch / front extension": ["projection", "height"],
  "Two-storey extension": ["projection", "height", "boundaryDistance"],
  "Loft dormer extension": ["dormerVolume", "height"],
  "Hip-to-gable roof extension": ["height"],
  "Roof lights": ["projection"],
  "Raising roof / ridge height": ["newRidge"],
  "Single-storey outbuilding": ["footprint", "height"],
  "Two-storey outbuilding": ["footprint", "height"],
  "Garage conversion": [],
  "Windows / doors": [],
  "Solar panels": ["projection"],
  "Fencing / gates": ["height"]
};

/* -------------------------------
  DOM ELEMENTS
------------------------------- */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false;

/* -------------------------------
  RENDER DIMENSIONS
------------------------------- */
function renderDimensionFields(projectType) {
  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";
    let type = "number";

    switch (field) {
      case "projection":
        label = "Projection (m) *";
        placeholder = "e.g., 3.2";
        break;
      case "width":
        label = "Width (m) *";
        placeholder = "e.g., 2.5";
        break;
      case "height":
        label = "Height (m) *";
        placeholder = "e.g., 2.8";
        break;
      case "boundaryDistance":
        label = "Distance to nearest boundary (m) *";
        placeholder = "e.g., 1.5";
        break;
      case "dormerVolume":
        label = "Dormer volume (m³) *";
        placeholder = "e.g., 40";
        break;
      case "newRidge":
        label = "New ridge height (m) *";
        placeholder = "e.g., 6.2";
        break;
      case "footprint":
        label = "Footprint (m²) *";
        placeholder = "e.g., 25";
        break;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("dimension-item");

    wrapper.innerHTML = `
      <label>${label}</label>
      <input type="${type}" step="0.1" id="${field}" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

renderDimensionFields(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});


/* -------------------------------
  SUBMIT HANDLER
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultLocked = true;

  // Show results card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `
    <div class="dot-loader">
      <div></div><div></div><div></div>
    </div>
  `;
  resultContent.innerHTML = "";

  // Scroll immediately
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: projectTypeSelect.value.trim(),
    areaStatus: document.getElementById("areaStatus").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    description: document.getElementById("description")?.value || "",
    dimensions: {}
  };

  const rules = dimensionRules[payload.projectType] || [];
  for (const f of rules) {
    const el = document.getElementById(f);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `<p style="color:red;text-align:center">Missing required dimensions.</p>`;
      return;
    }
    payload.dimensions[f] = el.value.trim();
  }

  // Postcode format check
  const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  if (!postcodePattern.test(payload.postcode)) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      <p style="color:red;text-align:center">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>
    `;
    return;
  }

  /* -------------------------------
        SEND TO WORKER
  ------------------------------- */
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    spinner.classList.add("hidden");

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    /* -------------------------------
          BUILD RESULT UI
    ------------------------------- */

    const pdScoreText = data.pdScore !== null ? `${data.pdScore}% confidence` : "not available";

    const risksHTML = Array.isArray(data.risks_html)
      ? data.risks_html.map(r => `<li>${r}</li>`).join("")
      : "<li>No risk data available.</li>";

    const designation = data.designation || { area: "unknown", property: "unknown" };

    resultContent.innerHTML = `
      <div class="fade-in">

        ${data.verdict_html || ""}

        ${data.summary_html || ""}

        <h3>PD Likelihood:</h3>
        <p><strong>${pdScoreText}</strong></p>

        <h3>Risk Factors</h3>
        <ul>${risksHTML}</ul>

        <h3>Constraint Interpretation</h3>
        <p><strong>Area:</strong> ${designation.area.replace(/_/g," ")}</p>
        <p><strong>Property status:</strong> ${designation.property.replace(/_/g," ")}</p>
        <p><strong>Local Authority:</strong> ${data.authority || "Unknown"}</p>
        <p><strong>Nation:</strong> ${data.nation || "Unknown"}</p>

        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong>
          This automated tool provides a general overview only. 
          Always confirm constraints with your local authority or a qualified planner.
        </p>
      </div>
    `;

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
