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
    POSTCODE VALIDATION + CLEANING
------------------------------- */
function isValidPostcode(postcode) {
  // Standard UK postcode regex
  const pattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  return pattern.test(postcode.trim());
}

function normalisePostcode(postcode) {
  // Uppercase, remove extra spaces, insert space before last 3 chars
  const pc = postcode.toUpperCase().replace(/\s+/g, "");
  return pc.replace(/(.{3})$/, " $1");
}

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
      default:
        label = field;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("dimension-item");

wrapper.innerHTML = `
  <label>${label}</label>
  <input 
    type="${type}" 
    id="${field}" 
    placeholder="${placeholder}" 
    required 
    step="any"
    inputmode="decimal"
    pattern="[0-9]*[.,]?[0-9]+"
  >
`;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

/* Update fields on load */
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
  
    // Validate postcode
  const postcodeInput = document.getElementById("postcode");
  const rawPostcode = postcodeInput.value.trim();

  if (!isValidPostcode(rawPostcode)) {
    resultCard.classList.remove("hidden");
    resultContent.innerHTML = `
      <p style="color:red;text-align:center;">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>`;
    resultCard.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // Clean it
  const postcode = normalisePostcode(rawPostcode);

  // Show loader
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `
    <div class="loader">
      <div></div><div></div><div></div>
    </div>
    <p style="text-align:center;color:#666;margin-top:8px;">Analysing your project…</p>
  `;

  resultCard.scrollIntoView({ behavior: "smooth" });

  // Build payload
  const payload = {
    postcode,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  // Add dynamic fields
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      resultContent.innerHTML = "<p style='color:red;text-align:center'>Missing required dimensions.</p>";
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
        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated general overview.
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

  } catch (err) {
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
