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
   FORM SUBMIT HANDLER
=========================================================================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.innerHTML = "";

  // Scroll to result card immediately
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  /* -------------------------
     Build request payload
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

  // Add dynamic dimension values
  const fields = dimensionRules[payload.projectType] || [];
  for (const field of fields) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = "<p style='color:red;text-align:center;'>Missing required dimensions.</p>";
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* -------------------------
     Send to Cloudflare Worker
  ------------------------- */
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

    /* ================================================================
       RENDER OPTION B — CONSULTANT-STYLE STRUCTURED REPORT
    ================================================================ */
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
          ${keyBenefits.length ? keyBenefits.map(b => `<li>${b}</li>`).join("") : "<li>No key benefits identified.</li>"}
        </ul>

        <h3>Key Risks</h3>
        <ul>
          ${keyRisks.length ? keyRisks.map(r => `<li>${r}</li>`).join("") : "<li>No major risks identified.</li>"}
        </ul>

        <h3>Professional Assessment</h3>
        <p>${professionalAssessment}</p>

        <h3>Recommendation</h3>
        <p>${recommendation}</p>

        <h3>Location Context</h3>
        <p><strong>Local Authority:</strong> ${location.localAuthority || "Unknown"}</p>
        <p><strong>Nation:</strong> ${location.nation || "Unknown"}</p>

        ${flags.incompleteUserInfo ? `
          <p style="opacity:0.7">
            <em>Some details were incomplete. The assessment includes added caution.</em>
          </p>` : ""}

        ${flags.possibleProtectedArea ? `
          <p style="opacity:0.7;color:#a03">
            <em>This postcode may fall within a protected area such as a Conservation Area.
            Confirming this is recommended.</em>
          </p>` : ""}

        <p class="disclaimer">
          This automated tool provides an early feasibility review.  
          Planning rules vary locally — confirm exact constraints with your local authority  
          or a qualified planning consultant.
        </p>

      </div>
    `;

    // Scroll again after results load
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
