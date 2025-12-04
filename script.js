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
  "Fencing / gates": ["height"],
  "Garden room": ["projection", "height", "boundaryDistance"]
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

/* -------------------------------
  POSTCODE VALIDATION
------------------------------- */
function isValidPostcode(pc) {
  const regex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  return regex.test(pc.trim());
}

/* -------------------------------
  RENDER DIMENSION FIELDS
------------------------------- */
function renderDimensionFields(projectType) {
  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";

    switch (field) {
      case "projection":
        label = "Projection (m) *"; placeholder = "e.g., 3"; break;
      case "width":
        label = "Width (m) *"; placeholder = "e.g., 2.5"; break;
      case "height":
        label = "Height (m) *"; placeholder = "e.g., 3"; break;
      case "boundaryDistance":
        label = "Distance to nearest boundary (m) *"; placeholder = "e.g., 2"; break;
      case "dormerVolume":
        label = "Dormer volume (m³) *"; placeholder = "e.g., 40"; break;
      case "newRidge":
        label = "New ridge height (m) *"; placeholder = "e.g., 6.2"; break;
      case "footprint":
        label = "Footprint (m²) *"; placeholder = "e.g., 25"; break;
      default:
        label = field;
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

renderDimensionFields(projectTypeSelect.value);

projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* -------------------------------
    SUBMIT HANDLER
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postcode = document.getElementById("postcode").value.trim();
  if (!isValidPostcode(postcode)) {
    resultCard.classList.remove("hidden");
    resultContent.innerHTML = `
      <p style="color:red; text-align:center;">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>`;
    return;
  }

  // Show result card + spinner
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.innerHTML = "";

  // Build payload
  const payload = {
    postcode,
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
      resultContent.innerHTML = "<p style='color:red;text-align:center'>Missing required dimensions.</p>";
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
      spinner.classList.add("hidden");
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    // Extract only safe fields (fixes disappearing output!)
    const conclusion = data.conclusion_html || "";
    const summary = data.summary_html || "";
    const details = data.details_html || "";

    if (!conclusion && !summary && !details) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = "<p style='color:red'>Invalid server response.</p>";
      return;
    }

    spinner.classList.add("hidden");

    // Render output
    resultContent.innerHTML = `
      <div class="fade-in">
        ${conclusion}
        ${summary}
        ${details}

        <p class="disclaimer" style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated general overview. 
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

    resultCard.scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
