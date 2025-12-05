/* -----------------------------------------
   DYNAMIC DIMENSION RULES
----------------------------------------- */
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
----------------------------------------- */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

/* -----------------------------------------
   RENDER DIMENSION FIELDS
----------------------------------------- */
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
        placeholder = "e.g., 3.5";
        break;
      case "width":
        label = "Width (m) *";
        placeholder = "e.g., 2.4";
        break;
      case "height":
        label = "Height (m) *";
        placeholder = "e.g., 3.2";
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
        placeholder = "e.g., 6.1";
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
      <input 
        type="${type}" 
        step="0.1"
        id="${field}" 
        placeholder="${placeholder}" 
        required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

// Initial load
renderDimensionFields(projectTypeSelect.value);

// Update on change
projectTypeSelect.addEventListener("change", () =>
  renderDimensionFields(projectTypeSelect.value)
);

/* -----------------------------------------
   SUBMIT HANDLER
----------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.innerHTML = "";

  // Scroll to loader immediately
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    areaStatus: document.getElementById("areaStatus").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    dimensions: {}
  };

  // Add dynamic dimension values
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML =
        "<p style='color:red;text-align:center;'>Missing required dimension fields.</p>";
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* -----------------------------------------
     SEND TO WORKER
  ----------------------------------------- */
  try {
    const res = await fetch(
      "https://walker-planning-worker.emichops.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    spinner.classList.add("hidden");

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    // Build final report layout
    resultContent.innerHTML = `
      <div class="fade-in">
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.explanation_html || ""}
        ${data.details_html || ""}
      </div>
    `;

    // Scroll to result
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML =
      `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
