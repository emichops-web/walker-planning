/* =======================================================
   PROJECT TYPE → DIMENSION RULES
======================================================= */
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

/* =======================================================
   DOM ELEMENTS
======================================================= */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const spinner = document.getElementById("spinner");
const resultContent = document.getElementById("resultContent");

/* =======================================================
   POSTCODE VALIDATION
======================================================= */
function isValidPostcode(pc) {
  const regex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  return regex.test(pc.trim());
}

/* =======================================================
   DYNAMIC DIMENSION FIELD RENDERING
======================================================= */
function renderDimensionFields(projectType) {
  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "e.g., 2.5";

    switch (field) {
      case "projection": label = "Projection (m) *"; break;
      case "width": label = "Width (m) *"; break;
      case "height": label = "Height (m) *"; break;
      case "boundaryDistance": label = "Distance to nearest boundary (m) *"; break;
      case "dormerVolume": label = "Dormer volume (m³) *"; break;
      case "newRidge": label = "New ridge height (m) *"; break;
      case "footprint": label = "Footprint (m²) *"; break;
      default: label = field;
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

// Initial render
renderDimensionFields(projectTypeSelect.value);

// Update dimensions when project type changes
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* =======================================================
   BULLET-PROOF AUTOSCROLL (never fails)
======================================================= */
function scrollToResults() {
  const header = document.querySelector(".top-banner");
  const headerHeight = header ? header.offsetHeight : 0;

  const targetY =
    resultCard.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    10;

  function doScroll() {
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 120);
      setTimeout(doScroll, 260);
    });
  });
}

/* =======================================================
   FORM SUBMIT HANDLER
======================================================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postcode = document.getElementById("postcode").value.trim().toUpperCase();

  // Validate postcode
  if (!isValidPostcode(postcode)) {
    resultCard.classList.remove("hidden");
    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      <p style="color:red;text-align:center;">
        Please enter a valid UK postcode (e.g., PH7 4BL).
      </p>
    `;
    scrollToResults();
    return;
  }

  // Show result area + loader
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = "";
  spinner.classList.remove("hidden");

  // SCROLL NOW — to show loader immediately
  scrollToResults();

  // Build payload
  const payload = {
    postcode,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  // Validate dynamic dimensions
  const rules = dimensionRules[payload.projectType] || [];
  for (const field of rules) {
    const el = document.getElementById(field);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `
        <p style='color:red;text-align:center'>
          Please complete all required dimensions.
        </p>
      `;
      scrollToResults();
      return;
    }
    payload.dimensions[field] = el.value.trim();
  }

  /* =======================================================
     SEND TO WORKER
  ======================================================== */
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
      scrollToResults();
      return;
    }

    // Safe extracted fields
    const conclusion = data.conclusion_html || "";
    const summary = data.summary_html || "";
    const details = data.details_html || "";
    const authority = data.localAuthority || "Unknown local authority";

    const warning = data.autoConstraints && data.autoConstraints !== "None"
      ? `<div class="sensitivity-warning fade-in">
           ⚠ This postcode appears within a designated or sensitive planning area.
         </div>`
      : "";

    const authorityBlock = `
      <p style="font-size:0.95rem; opacity:0.9; margin-bottom:10px;">
        <strong>Local Authority:</strong> ${authority}
      </p>
    `;

    // Render full results
    resultContent.innerHTML = `
      ${warning}
      ${authorityBlock}
      <div class="fade-in">
        ${conclusion}
        ${summary}
        ${details}
        <p class="disclaimer" style="margin-top:20px; font-size:0.9rem; opacity:0.9;">
          <strong>Disclaimer:</strong> This tool provides an automated overview.
          Always confirm findings with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

    // SCROLL AGAIN — when results appear
    scrollToResults();

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML =
      `<p style="color:red">Error: ${err.message}</p>`;
    scrollToResults();
  }
});
