/* ============================================================
   DYNAMIC DIMENSION RULES
============================================================ */
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
  "Fencing / gates": ["height"],
  "Garden room": ["projection", "height", "boundaryDistance"]
};

/* ============================================================
   DOM ELEMENTS
============================================================ */
const form = document.getElementById("planningForm");
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");
const apiURL = "https://walker-planning-worker.emichops.workers.dev/";

/* ============================================================
   RESULT LOCK (Prevents UI from overwriting results)
============================================================ */
let resultLocked = false;

/* ============================================================
   POSTCODE VALIDATION (UK Format)
============================================================ */
function isValidUKPostcode(pc) {
  const cleaned = pc.replace(/\s+/g, "");
  const regex = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i;
  return regex.test(cleaned);
}

/* ============================================================
   RENDER DIMENSION FIELDS
============================================================ */
function renderDimensionFields(projectType) {
  if (resultLocked) return; // ⛔ Prevent UI resets after results show

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
      <input type="${type}" id="${field}" step="0.1" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

/* Initial dimension field load */
renderDimensionFields(projectTypeSelect.value);

/* Update fields when project type changes */
projectTypeSelect.addEventListener("change", () => {
  if (resultLocked) return;
  renderDimensionFields(projectTypeSelect.value);
});

/* ============================================================
   FORM SUBMISSION
============================================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate postcode
  const postcode = document.getElementById("postcode").value.trim();
  if (!isValidUKPostcode(postcode)) {
    resultCard.classList.remove("hidden");
    resultContent.innerHTML = `
      <p style='color:red;text-align:center'>
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>`;
    return;
  }

  // Show spinner
  spinner.classList.remove("hidden");
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = ""; // cleared while spinner shows
  resultCard.scrollIntoView({ behavior: "smooth" });

  // Build payload
  const payload = {
    postcode,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: projectTypeSelect.value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  // Add dynamic dimension values
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

  /* ============================================================
     SEND REQUEST TO WORKER
  ============================================================ */
  try {
    const res = await fetch(apiURL, {
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

    // Mark results as locked (prevent UI reset)
    resultLocked = true;

    /* ============================================================
       BUILD RESULTS UI
    ============================================================ */

    let warningBanner = "";
    if (data.autoConstraints !== "None") {
      warningBanner = `
        <div class="sensitivity-banner fade-in">
          ⚠ This area includes designated or sensitive planning zones. 
          Permitted development rights may be restricted.
        </div>`;
    }

    let localAuthorityTag = `
      <p class="local-authority-tag fade-in">
        📍 Local authority: <strong>${data.localAuthority}</strong>
      </p>`;

    resultContent.innerHTML = `
      ${warningBanner}
      ${localAuthorityTag}

      <div class="fade-in">
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated overview.
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
