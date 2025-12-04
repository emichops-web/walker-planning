/* ---------------------------------------------------
   PROJECT TYPE → DIMENSION RULES
----------------------------------------------------- */
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

/* ---------------------------------------------------
   DOM ELEMENTS
----------------------------------------------------- */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false; // prevents flicker on updates

/* ---------------------------------------------------
   RENDER DYNAMIC DIMENSIONS
----------------------------------------------------- */
function renderDimensionFields(projectType) {
  if (resultLocked) return; // avoid UI glitch when results fading in

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

/* Load initial set on page load */
renderDimensionFields(projectTypeSelect.value);

/* Re-render on project change */
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* ---------------------------------------------------
   SUBMIT HANDLER
----------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // LOCK output rendering to avoid flicker from dynamic fields
  resultLocked = true;

  // Show card + loader immediately
  resultCard.classList.remove("hidden");
  
  spinner.classList.remove("hidden");
spinner.innerHTML = `
  <div class="loader">
    <div></div>
    <div></div>
    <div></div>
  </div>
`;

  // Clear previous results while loading
  resultContent.innerHTML = "";

  // FIRST AUTOSCROLL → show loader instantly
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Validate postcode format
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
    description: document.getElementById("projectDescription").value.trim(),
    dimensions: {}
  };

  // Add dynamic fields to payload
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `
        <p style="color:red; text-align:center;">Missing required dimensions.</p>
      `;
      resultLocked = false;
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* ---------------------------------------------------
     SEND REQUEST TO WORKER
  ----------------------------------------------------- */
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

    /* ---------------------------------------------------
       Render AI Output
    ----------------------------------------------------- */
    resultContent.innerHTML = `
      <div class="fade-in">
      <div class="la-label">
        ${data.localAuthority ? `${data.localAuthority}` : ""}
      </div>
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          <strong>Disclaimer:</strong> This tool provides an automated general overview.
          Planning rules vary locally — always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

    // SECOND AUTOSCROLL → scroll AFTER results appear
    setTimeout(() => {
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }

  resultLocked = false;
});
