/* -------------------------------
  PROJECT TYPE → DIMENSION RULES
------------------------------- */
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["width", "height", "boundary"],
  "Wrap-around extension": ["projection", "width", "height"],
  "Porch / front extension": ["projection", "height"],
  "Two-storey extension": ["projection", "height", "boundary"],
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

  if (fields.length === 0) {
    return; // No dimension inputs required
  }

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
      case "boundary":
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
      default:
        label = field;
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

/* Update fields on load (default selection) */
renderDimensionFields(projectTypeSelect.value);

/* Update fields when project type changes */
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* -------------------------------
    FORM SUBMISSION HANDLER
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show result card + loader animation
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `
    <div class="loader">
      <div></div><div></div><div></div>
    </div>
    <p style="text-align:center;color:#666;margin-top:8px;">Analysing your project…</p>
  `;

  // Auto-scroll to results
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

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
      resultContent.innerHTML = `<p style='color:red;text-align:center'>Missing required dimensions.</p>`;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      resultContent.innerHTML = `
        <p style="color:#c00;font-weight:600">${data.error}</p>
      `;
      return;
    }

    // Insert AI HTML with smooth fade-in
    resultContent.innerHTML = `
      <div class="fade-in">
        ${data.conclusion_html}
        ${data.summary_html}
        ${data.details_html}
        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated general overview.
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

  } catch (err) {
    resultContent.innerHTML = `<p style="color:#c00">Request failed: ${err.message}</p>`;
  }
});

  // SEND TO WORKER
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      resultContent.innerHTML = `<span style="color:red">Server error: ${data.error}</span>`;
      return;
    }

    // Build HTML
    const html = `
      ${data.conclusion_html || ""}
      ${data.summary_html || ""}
      ${data.details_html || ""}
      <p style="margin-top:20px;"><strong>Disclaimer:</strong> This tool provides an automated general overview. Planning rules vary locally. Always consult your local planning authority or a qualified planning consultant before starting work.</p>
    `;

    resultContent.innerHTML = html;

  } catch (err) {
    resultContent.innerHTML = `<span style="color:red">Request failed: ${err.message}</span>`;
  }
});
