/* -----------------------------------------------------------
   RESULT: Option-C structured formatting
----------------------------------------------------------- */

const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false;

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
    RENDER DIMENSION FIELDS
------------------------------- */
function renderDimensionFields(projectType) {
  if (resultLocked) return;
  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("dimension-item");

    let label = "";
    let placeholder = "";

    switch (field) {
      case "projection": label = "Projection (m) *"; placeholder = "e.g., 3"; break;
      case "width": label = "Width (m) *"; placeholder = "e.g., 2.5"; break;
      case "height": label = "Height (m) *"; placeholder = "e.g., 3"; break;
      case "boundaryDistance": label = "Distance to nearest boundary (m) *"; placeholder = "e.g., 2"; break;
      case "dormerVolume": label = "Dormer volume (m³) *"; placeholder = "e.g., 40"; break;
      case "newRidge": label = "New ridge height (m) *"; placeholder = "e.g., 6.2"; break;
      case "footprint": label = "Footprint (m²) *"; placeholder = "e.g., 25"; break;
    }

    wrapper.innerHTML = `
      <label>${label}</label>
      <input type="number" step="0.1" id="${field}" placeholder="${placeholder}" required>
    `;
    dimensionFieldsContainer.appendChild(wrapper);
  });
}

renderDimensionFields(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => renderDimensionFields(projectTypeSelect.value));


/* -----------------------------------------------------------
   SUBMIT HANDLER
----------------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultLocked = true;
  resultCard.classList.remove("hidden");

  spinner.classList.remove("hidden");
  spinner.innerHTML = `
    <div class="loader">
      <div></div><div></div><div></div>
    </div>
  `;

  resultContent.innerHTML = "";

  // Scroll immediately to loader
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ---------------------------
        Build payload
  ----------------------------*/
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    description: document.getElementById("description")?.value?.trim() || "",
    dimensions: {}
  };

  // Dimension validation
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `<p style="color:red;text-align:center">Missing required dimensions.</p>`;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* ---------------------------
        Send to Worker
  ----------------------------*/
  let data;
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    data = await res.json();
  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Server error: ${err.message}</p>`;
    return;
  }

  if (data.error) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
    return;
  }

  /* -----------------------------------------------------------
     OPTION C — STRUCTURED RESULT RENDERING
  ----------------------------------------------------------- */

  const verdictColours = {
    allowed: "verdict-allowed",
    refused: "verdict-refused",
    uncertain: "verdict-uncertain"
  };

  const verdictClass = verdictColours[data.verdict] || "verdict-uncertain";

  const confidence = data.confidence !== undefined ? `${data.confidence}%` : "—";

  const risksHTML = data.riskFactors?.length
    ? `
    <div class="result-section">
      <h3>Risk Factors</h3>
      <ul>
        ${data.riskFactors.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>`
    : "";

  const detailHTML = data.details?.length
    ? `
    <div class="result-section">
      <h3>Additional Notes</h3>
      <ul>
        ${data.details.map(d => `<li>${d}</li>`).join("")}
      </ul>
    </div>`
    : "";

  /* Final HTML Output */
  resultContent.innerHTML = `
    <div class="fade-in">

      <div class="la-label">${data.localAuthority || ""}</div>

      <div class="verdict-pill ${verdictClass}">
        ${data.verdictText || "Result"}
      </div>

      <p class="pd-confidence"><strong>PD Likelihood:</strong> ${confidence} confidence</p>

      <p class="pd-summary">${data.summary || ""}</p>

      ${risksHTML}
      ${detailHTML}

      <p class="disclaimer">
        <strong>Disclaimer:</strong> This tool provides an automated general overview.
        Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
      </p>
    </div>
  `;

  spinner.classList.add("hidden");

  // Final scroll into full result
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
});
