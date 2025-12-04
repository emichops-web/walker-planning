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
  const pattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  return pattern.test(postcode.trim());
}

function normalisePostcode(postcode) {
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
const riskBanner = document.getElementById("riskBanner");
const spinner = document.getElementById("spinner");

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
      case "projection": label = "Projection (m) *"; placeholder = "e.g., 3"; break;
      case "width": label = "Width (m) *"; placeholder = "e.g., 2.5"; break;
      case "height": label = "Height (m) *"; placeholder = "e.g., 3"; break;
      case "boundaryDistance": label = "Distance to nearest boundary (m) *"; placeholder = "e.g., 2"; break;
      case "dormerVolume": label = "Dormer volume (m³) *"; placeholder = "e.g., 40"; break;
      case "newRidge": label = "New ridge height (m) *"; placeholder = "e.g., 6.2"; break;
      case "footprint": label = "Footprint (m²) *"; placeholder = "e.g., 25"; break;
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
    SUBMIT HANDLER (UPDATED)
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset UI
  riskBanner.classList.add("hidden");
  spinner.classList.remove("hidden");
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `<p class="loading-text">Analysing...</p>`;
  resultCard.scrollIntoView({ behavior: "smooth" });

  // Validate and clean postcode
  const postcodeInput = document.getElementById("postcode");
  const rawPostcode = postcodeInput.value.trim();

  if (!isValidPostcode(rawPostcode)) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      <p style="color:red;text-align:center;">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>`;
    return;
  }

  const postcode = normalisePostcode(rawPostcode);

  // Build payload
  const payload = {
    postcode,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  // Attach dimensional data
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = "<p class='error-msg'>Missing required dimensions.</p>";
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
      resultContent.innerHTML = `<p class="error-msg">${data.error}</p>`;
      return;
    }

    // Auto-fill constraints dropdown
    if (data.autoConstraints && data.autoConstraints !== "None") {
      document.getElementById("constraints").value = data.autoConstraints;
    }

    // Local Authority label
    let laLabel = "";
    if (data.localAuthority) {
      laLabel = `
        <p class="la-label">
          Local authority: <strong>${data.localAuthority}</strong>
        </p>
      `;
    }

    // High sensitivity area banner
    if (data.sensitivityLevel === "high") {
      riskBanner.textContent =
        "⚠ This area includes designated or sensitive planning zones. Permitted development rights may be restricted.";
      riskBanner.classList.remove("hidden");
    }

    // Render results
    resultContent.innerHTML = `
      <div class="fade-in">
        ${laLabel}
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
        <p class="disclaimer">
          <strong>Disclaimer:</strong> This automated tool provides a general overview.
          Always verify with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p class='error-msg'>Request failed: ${err.message}</p>`;
  }
});
