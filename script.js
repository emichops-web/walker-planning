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
  RENDER DIMENSIONS (SAFE)
------------------------------- */
function renderDimensionFields(projectType) {
  if (resultLocked) return; // prevent wipes after result

  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";

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
      <input type="number" step="0.1" id="${field}" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

/* Initial render */
renderDimensionFields(projectTypeSelect.value);

/* -------------------------------
  PREVENT ANY UI CHANGES AFTER RESULT
------------------------------- */
let lastProjectValue = projectTypeSelect.value;

projectTypeSelect.addEventListener("change", () => {
  if (resultLocked) return;
  const current = projectTypeSelect.value;
  if (current !== lastProjectValue) {
    lastProjectValue = current;
    renderDimensionFields(current);
  }
});

/* -------------------------------
    SUBMIT HANDLER (FINAL + STABLE)
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultLocked = false; // reset lock ONLY before request
  resultCard.classList.remove("hidden");

  // Clear previous content then show spinner
  resultContent.innerHTML = "";
  spinner.classList.remove("hidden");

  resultCard.scrollIntoView({ behavior: "smooth" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML =
        "<p style='color:red;text-align:center'>Missing required dimensions.</p>";
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* ---------------------------
      SEND TO WORKER
  ----------------------------*/
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

    // Build optional banners
    let warningHTML =
      data.autoConstraints !== "None"
        ? `<div class="sensitivity-banner fade-in">
             ⚠ This area includes designated or sensitive planning zones.
           </div>`
        : "";

    let authorityHTML =
      data.localAuthority
        ? `<p class="result-meta"><strong>Local Authority:</strong> ${data.localAuthority}</p>`
        : "";

    // Render result
    resultContent.innerHTML = `
      ${warningHTML}
      ${authorityHTML}
      <div class="fade-in">
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
        <p class="disclaimer">
          <strong>Disclaimer:</strong> This tool provides an automated general overview.
          Always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

    // 🔒 Lock AFTER content is written
    setTimeout(() => {
      resultLocked = true;
    }, 150);

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
});
