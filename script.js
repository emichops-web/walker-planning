/* =========================================================================
   DOM ELEMENTS
=========================================================================== */
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");


/* =========================================================================
   DYNAMIC DIMENSION FIELDS
=========================================================================== */
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

function renderDimensionFields(type) {
  dimensionFieldsContainer.innerHTML = "";
  const fields = dimensionRules[type] || [];

  fields.forEach(field => {
    let label = "";
    let placeholder = "";
    let step = "0.1";

    switch (field) {
      case "projection": label = "Projection (m)"; placeholder = "e.g., 3"; break;
      case "width":      label = "Width (m)"; placeholder = "e.g., 2.5"; break;
      case "height":     label = "Height (m)"; placeholder = "e.g., 3"; break;
      case "boundaryDistance": label = "Distance to boundary (m)"; placeholder = "e.g., 2"; break;
      case "dormerVolume":     label = "Dormer volume (m³)"; placeholder = "e.g., 40"; step = "1"; break;
      case "newRidge":         label = "New ridge height (m)"; placeholder = "e.g., 6.2"; break;
      case "footprint":        label = "Footprint (m²)"; placeholder = "e.g., 25"; step = "1"; break;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "dimension-item";
    wrapper.innerHTML = `
      <label>${label}</label>
      <input 
        type="number" 
        id="${field}" 
        placeholder="${placeholder}" 
        step="${step}"
        required
      >
    `;
    dimensionFieldsContainer.appendChild(wrapper);
  });
}

renderDimensionFields(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});


/* =========================================================================
   SUBMIT HANDLER
=========================================================================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.innerHTML = "";
  
  // Scroll immediately
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  /* -------------------------
     Build payload
  ------------------------- */
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    areaStatus: document.getElementById("areaDesignation").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    projectDescription: document.getElementById("projectDescription").value.trim(),
    dimensions: {}
  };

  // Add dynamic dimensions
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = "<p style='color:red;text-align:center'>Missing required dimensions.</p>";
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* -------------------------
     Send to Worker
  ------------------------- */
  try {
    const response = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    spinner.classList.add("hidden");

    if (data.error) {
      resultContent.innerHTML = `<p style='color:red'>${data.error}</p>`;
      return;
    }

    /* ---------------------------------------------------------------
       FORMAT THE NEW STRUCTURED RESULTS (Option B)
    ---------------------------------------------------------------- */
    const { 
      verdict, 
      headline, 
      confidence,
      executiveSummary,
      keyBenefits = [],
      keyRisks = [],
      professionalAssessment,
      recommendation,
      location = {},
      flags = {}
    } = data;

    const verdictClass =
      verdict === "allowed" ? "verdict-allowed" :
      verdict === "refused" ? "verdict-refused" :
      "verdict-uncertain";

    resultContent.innerHTML = `
      <div class="fade-in">

        <div class="verdict-pill ${verdictClass}">
          ${headline}
        </div>

        <h3>PD Confidence</h3>
        <p><strong>${confidence}% likelihood</strong></p>

        <h3>Summary</h3>
        <p>${executiveSummary}</p>

        <h3>Key Benefits</h3>
        <ul>
          ${keyBenefits.map(b => `<li>${b}</li>`).join("")}
        </ul>

        <h3>Key Risks</h3>
        <ul>
          ${
            keyRisks.length
              ? keyRisks.map(r => `<li>${r}</li>`).join("")
              : "<li>No significant risks identified.</li>"
          }
        </ul>

        <h3>Professional Assessment</h3>
        <p>${professionalAssessment}</p>

        <h3>Recommendation</h3>
        <p>${recommendation}</p>

        <h3>Location Context</h3>
        <p><strong>Local Authority:</strong> ${location.localAuthority || "Unknown"}</p>
        <p><strong>Nation:</strong> ${location.nation || "Unknown"}</p>

        ${
          flags.incompleteUserInfo
            ? `<p style="opacity:0.7"><em>Note: Some inputs were incomplete, so the assessment includes added caution.</em></p>`
            : ""
        }

        ${
          flags.possibleProtectedArea
            ? `<p style="opacity:0.7;color:#b06"><em>Warning: Automatic checks suggest this postcode may fall in a protected area (e.g., Conservation Area). Confirming the designation is recommended.</em></p>`
            : ""
        }

        <p class="disclaimer">
          This tool provides an automated early feasibility review.  
          Local variations apply — confirm exact constraints with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style='color:red'>Request failed: ${err.message}</p>`;
  }
});
