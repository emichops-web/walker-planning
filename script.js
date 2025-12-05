/* ============================================================
    WALKER PLANNING – FRONTEND SCRIPT (v3.0)
    Fully aligned with Worker.js narrative engine
    - Dynamic dimension fields
    - Loader animation
    - Autoscroll
    - Safe rendering of all narrative blocks
=============================================================== */

/* -----------------------------------------
   DIMENSION RULES BY PROJECT TYPE
-------------------------------------------- */
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

/* -----------------------------------------
   DOM ELEMENTS
-------------------------------------------- */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");

const loaderHTML = `
  <div class="loader">
    <div></div><div></div><div></div>
  </div>
  <p style="text-align:center;color:#666;margin-top:8px;">Analysing your project…</p>
`;

/* -----------------------------------------
   RENDER DIMENSION FIELDS
-------------------------------------------- */
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
        placeholder = "e.g., 3.0";
        break;
      case "width":
        label = "Width (m) *";
        placeholder = "e.g., 2.5";
        break;
      case "height":
        label = "Height (m) *";
        placeholder = "e.g., 3.0";
        break;
      case "boundaryDistance":
        label = "Distance to nearest boundary (m) *";
        placeholder = "e.g., 2.0";
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
      default:
        label = field;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("dimension-item");

    wrapper.innerHTML = `
      <label>${label}</label>
      <input type="${type}"
             inputmode="decimal"
             step="0.1"
             id="${field}"
             placeholder="${placeholder}"
             required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

// Initialise fields
renderDimensionFields(projectTypeSelect.value);

// Update on change
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});


/* -----------------------------------------
   FORM SUBMISSION HANDLER
-------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loader immediately
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = loaderHTML;

  // Scroll to results box BEFORE waiting
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    areaStatus: document.getElementById("areaStatus")?.value || "unknown",
    propertyStatus: document.getElementById("propertyStatus")?.value || "unknown",
    description: document.getElementById("projectDescription")?.value || "",
    dimensions: {}
  };

  // Collect dynamic dimension values
  const fields = dimensionRules[payload.projectType] || [];
  for (const field of fields) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      resultContent.innerHTML = `<p style='color:red;text-align:center;'>Missing required dimension: ${field}</p>`;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* -----------------------------------------
     SEND TO WORKER
  -------------------------------------------- */
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    /* -----------------------------------------
       RENDER OUTPUT SECTIONS (only if exist)
    -------------------------------------------- */

    const section = (title, html) => {
      if (!html || html.trim() === "") return "";
      return `
        <div class="report-section">
          ${html}
        </div>
      `;
    };

    resultContent.innerHTML = `
      <div class="fade-in">

        ${section("Verdict", data.verdict)}
        ${section("Summary", data.summary)}
        ${section("Benefits", data.benefits)}
        ${section("Risks", data.risks)}
        ${section("Assessment", data.assessment)}
        ${section("Recommendation", data.recommendation)}
        ${section("Location", data.location)}

        <p class="disclaimer">
          <strong>Note:</strong> This automated assessment provides an initial indication only.
          Walker Planning can provide a formal planning appraisal if required.
        </p>
      </div>
    `;

  } catch (err) {
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
