/* ---------------------------------------------------------
   DOM ELEMENTS
--------------------------------------------------------- */
const form = document.getElementById("planningForm");
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

/* ---------------------------------------------------------
   DYNAMIC DIMENSION RULES
--------------------------------------------------------- */
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["width", "height", "boundary"],
  "Wrap-around extension": ["projection", "width", "height", "boundary"],
  "Garden room": ["footprint", "height", "boundary"],
  "Loft dormer extension": ["dormerVolume", "height"],
  "Porch / front extension": ["projection", "height"],
  "Garage conversion": [],
  "Raising roof / ridge height": ["newRidge"],
  "Solar panels": ["projection"],
};

/* ---------------------------------------------------------
   RENDER DIMENSION FIELDS BASED ON PROJECT TYPE
--------------------------------------------------------- */
function renderDimensionFields(type) {
  const fields = dimensionRules[type] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";
    let unit = "(m)";

    switch (field) {
      case "projection":
        label = "Projection " + unit;
        placeholder = "e.g., 3.5";
        break;
      case "width":
        label = "Width " + unit;
        placeholder = "e.g., 2.5";
        break;
      case "height":
        label = "Height " + unit;
        placeholder = "e.g., 3.0";
        break;
      case "boundary":
        label = "Distance to boundary " + unit;
        placeholder = "e.g., 2";
        break;
      case "footprint":
        label = "Footprint (m²)";
        placeholder = "e.g., 25";
        break;
      case "dormerVolume":
        label = "Dormer volume (m³)";
        placeholder = "e.g., 40";
        break;
      case "newRidge":
        label = "New ridge height " + unit;
        placeholder = "e.g., 6.2";
        break;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("dimension-item");
    wrapper.innerHTML = `
      <label>${label}</label>
      <input 
        type="number" 
        step="0.1"
        id="${field}" 
        placeholder="${placeholder}" 
        required
      >
    `;
    dimensionFieldsContainer.appendChild(wrapper);
  });
}

// Initialize fields on load
renderDimensionFields(projectTypeSelect.value);

// Update on project type change
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});


/* ---------------------------------------------------------
   SUBMIT HANDLER
--------------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show result card + loader immediately
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `
    <div class="dot-loader">
      <div></div><div></div><div></div>
    </div>
  `;
  resultContent.innerHTML = "";

  // Auto-scroll to loader
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  /* -------- Build payload -------- */
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    areaStatus: document.getElementById("areaDesignation").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    description: document.getElementById("projectDescription").value.trim(),
    dimensions: {}
  };

  // Validate postcode
  const pc = payload.postcode;
  const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

  if (!postcodePattern.test(pc)) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      <p style="color:red; text-align:center;">
        Please enter a valid UK postcode.
      </p>
    `;
    return;
  }

  // Add dynamic dimension fields
  const dimList = dimensionRules[payload.projectType] || [];
  for (const field of dimList) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `
        <p style="color:red;text-align:center">
          Missing required dimension: <strong>${field}</strong>
        </p>`;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* -------- Send to Worker -------- */
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

    /* -------- Render result -------- */
    resultContent.innerHTML = `
      <div class="fade-in">

        ${data.conclusion_html || ""}

        <p>${data.summary_html || ""}</p>

        <h3>PD Likelihood:</h3>
        <p><strong>${data.pdScore}% confidence</strong></p>

        ${data.explanation_html || ""}

        <h3>Risk Factors</h3>
        ${data.details_html || ""}

        <p style="margin-top:20px;font-size:0.9rem;opacity:0.7;">
          <strong>Disclaimer:</strong> This automated tool provides a general overview only.
          Always confirm constraints with your local authority or a qualified planner.
        </p>
      </div>
    `;

    // Final scroll to result
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
