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
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

/* =======================================================
   POSTCODE VALIDATION
======================================================= */
function isValidPostcode(pc) {
  const regex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  return regex.test(pc.trim());
}

/* =======================================================
   RENDER DYNAMIC DIMENSION FIELDS
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

renderDimensionFields(projectTypeSelect.value);

projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* =======================================================
   SUBMIT HANDLER
======================================================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const postcode = document.getElementById("postcode").value.trim().toUpperCase();

  // Postcode validation
  if (!isValidPostcode(postcode)) {
    resultCard.classList.remove("hidden");
    resultContent.innerHTML =
      `<p style="color:red;text-align:center;">
         Please enter a valid UK postcode (e.g., PH7 4BL).
       </p>`;
    return;
  }

  // Show result card and loader
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = "";
  spinner.classList.remove("hidden");

  // Build payload
  const payload = {
    postcode,
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    dimensions: {}
  };

  // Add dynamic dimension fields
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
      return;
    }

    // Accept only valid fields from Worker
    const conclusion = data.conclusion_html || "";
    const summary = data.summary_html || "";
    const details = data.details_html || "";

    if (!conclusion && !summary && !details) {
      resultContent.innerHTML =
        "<p style='color:red'>Invalid server response.</p>";
      return;
    }

    // Optional sensitivity warning
    const warning = data.autoConstraints && data.autoConstraints !== "None"
      ? `<div class="sensitivity-warning fade-in">
           ⚠ This project appears to be within a designated or sensitive planning area.
         </div>`
      : "";

    const authorityBlock = data.localAuthority
      ? `<p><strong>Local Authority:</strong> ${data.localAuthority}</p>`
      : "";

    // Render final result
    resultContent.innerHTML = `
      ${warning}
      ${authorityBlock}
      <div class="fade-in">
        ${conclusion}
        ${summary}
        ${details}
        <p class="disclaimer" style="margin-top:20px; font-size:0.9rem; opacity:0.9;">
          <strong>Disclaimer:</strong> This tool provides a general overview.
          Always confirm with your local authority or a qualified planning consultant.
        </p>
      </div>
    `;

    // Smooth scroll AFTER fade-in starts
    setTimeout(() => {
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML =
      `<p style="color:red">Error: ${err.message}</p>`;
  }
});
