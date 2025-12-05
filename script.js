/* ---------------------------------------
   PROJECT TYPE → DIMENSION RULES
--------------------------------------- */
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

/* ---------------------------------------
   DOM ELEMENTS
--------------------------------------- */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false;

/* ---------------------------------------
   RENDER DYNAMIC DIMENSION FIELDS
--------------------------------------- */
function renderDimensionFields(projectType) {
  if (resultLocked) return;
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
      <input type="${type}" id="${field}" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(wrapper);
  });
}

renderDimensionFields(projectTypeSelect.value);

projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* ---------------------------------------
   SUBMIT HANDLER
--------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Lock rendering until AI output arrives
  resultLocked = true;

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `
    <div class="dot-loader">
      <div></div><div></div><div></div>
    </div>
  `;
  resultContent.innerHTML = "";

  // Scroll immediately to loader
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Validate postcode
  const postcodeInput = document.getElementById("postcode").value.trim();
  const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

  if (!postcodePattern.test(postcodeInput)) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      <p style="color:red; text-align:center;">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>
    `;
    resultLocked = false;
    return;
  }

  // Build payload
  const payload = {
    postcode: postcodeInput,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    projectDescription: document.getElementById("projectDescription").value.trim(),
    dimensions: {}
  };

  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `
        <p style='color:red; text-align:center;'>Missing required dimensions.</p>
      `;
      resultLocked = false;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* ---------------------------------------
     SEND TO WORKER
  --------------------------------------- */
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
      resultLocked = false;
      return;
    }

    /* ---------------------------------------
       BUILD UI OUTPUT (Option C Structured)
    --------------------------------------- */

    const verdictPill = data.verdict === "allowed"
      ? `<div class="verdict-pill verdict-allowed">Appears Permitted Development – Planning Permission Not Expected</div>`
      : data.verdict === "refused"
      ? `<div class="verdict-pill verdict-refused">Planning Permission Required</div>`
      : `<div class="verdict-pill verdict-uncertain">Uncertain – Further Assessment Recommended</div>`;

    const riskList = data.riskFactors?.length
      ? `<ul>${data.riskFactors.map(r => `<li>${r}</li>`).join("")}</ul>`
      : `<p>No significant risk factors identified.</p>`;

    const notesList = data.details?.length
      ? `<ul>${data.details.map(r => `<li>${r}</li>`).join("")}</ul>`
      : "";

    const designationLabel =
      data.designations && (
        data.designations.conservation ||
        data.designations.nationalPark ||
        data.designations.aonb
      )
        ? `<div class="designation-warning">⚠ This site is in a protected or designated area.</div>`
        : "";

    resultContent.innerHTML = `
      <div class="fade-in">

        <h3>${data.localAuthority || ""}</h3>

        ${verdictPill}

        <p><strong>PD Likelihood:</strong> ${data.confidence || 0}% confidence</p>

        ${designationLabel}

        <p>${data.summary || ""}</p>

        <h4>Risk Factors</h4>
        ${riskList}

        <h4>Additional Notes</h4>
        ${notesList}

        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated general overview.
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>

      </div>
    `;

    // Scroll to results fully
    setTimeout(() => {
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }

  resultLocked = false;
});
