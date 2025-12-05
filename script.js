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

/* -------------------------------
  UPDATE DIMENSION FIELDS
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
        placeholder = "e.g., 3";
        break;
      case "width":
        label = "Width (m) *";
        placeholder = "e.g., 2.5";
        break;
      case "height":
        label = "Height (m) *";
        placeholder = "e.g., 3";
        break;
      case "boundaryDistance":
        label = "Distance to nearest boundary (m) *";
        placeholder = "e.g., 2";
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
      <input type="${type}" id="${field}" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

/* Initial load */
renderDimensionFields(projectTypeSelect.value);

/* Update fields when project changes */
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* -------------------------------
    SUBMIT HANDLER
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loader
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `
    <div class="loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <p style="text-align:center;color:#666;margin-top:8px;">Analysing your project…</p>
  `;

  resultCard.scrollIntoView({ behavior: "smooth" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),

    // NEW FIELDS
    areaDesignation: document.getElementById("areaDesignation").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),

    // Description field
    description: document.getElementById("description") 
      ? document.getElementById("description").value.trim()
      : "",

    dimensions: {}
  };

  // Add dynamic fields
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      resultContent.innerHTML =
        "<p style='color:red;text-align:center'>Missing required dimensions.</p>";
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* SEND TO WORKER */
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    // SUCCESS — AI Output
    resultContent.innerHTML = `
      <div class="fade-in">
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
        <p class="location-tag">
          Local Authority: <strong>${data.localAuthority || "Unknown"}</strong>
        </p>
        <p class="designation-tag">
          Area Type: <strong>${data.autoDesignation || "Unknown"}</strong>
        </p>
        <p class="disclaimer">
          <strong>Disclaimer:</strong> This automated tool provides a general overview only.
          Always confirm constraints with your local authority or a qualified planner.
        </p>
      </div>
    `;

  } catch (err) {
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
