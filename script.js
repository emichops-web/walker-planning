/* ------------------------------
   DOM ELEMENTS
------------------------------ */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFieldsContainer");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false;

/* ------------------------------
   PROJECT TYPE → DIMENSION RULES
   (Restored full version)
------------------------------ */
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["projection", "height", "boundary"],
  "Wrap-around extension": ["projection", "height", "boundary"],
  "Porch / front extension": ["projection", "height"],
  "Loft conversion": ["height"],
  "Dormer extension": ["height", "projection"],
  "Garage conversion": [],
  "Two-storey extension": ["projection", "height", "boundary"],
  "Garden room / outbuilding": ["projection", "height", "boundary"],
  "Annex / ancillary accommodation": ["projection", "height", "boundary"]
};

/* ------------------------------
   RENDER DYNAMIC FIELDS
------------------------------ */
function renderDimensionFields() {
  if (resultLocked) return;
  const fields = dimensionRules[projectTypeSelect.value] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";
    let type = "number";

    if (field === "projection") {
      label = "Projection (m)";
      placeholder = "e.g., 3";
    } else if (field === "height") {
      label = "Height (m)";
      placeholder = "e.g., 3";
    } else if (field === "boundary") {
      label = "Distance to nearest boundary (m)";
      placeholder = "e.g., 2";
    }

    dimensionFieldsContainer.insertAdjacentHTML(
      "beforeend",
      `
        <div class="form-group">
          <label>${label} *</label>
          <input type="${type}" id="${field}" placeholder="${placeholder}" step="0.1" required />
        </div>
      `
    );
  });
}

/* ------------------------------
   ON PROJECT TYPE CHANGE
------------------------------ */
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields();
});

/* ------------------------------
   FORM SUBMISSION
------------------------------ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultLocked = true;

  // Show result card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `
    <div class="loader">
      <div></div><div></div><div></div>
    </div>
  `;

  resultContent.innerHTML = "";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: projectTypeSelect.value.trim(),
    areaStatus: document.getElementById("areaStatus").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    description: document.getElementById("description").value.trim(),
    dimensions: {}
  };

  const dimList = dimensionRules[payload.projectType] || [];
  dimList.forEach(f => {
    const el = document.getElementById(f);
    payload.dimensions[f] = el ? el.value : null;
  });

  // Send request
  let response;
  try {
    response = await fetch("https://walker-planning-worker.emichops.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = "<p>Network error — please try again.</p>";
    return;
  }

  spinner.classList.add("hidden");

  let data;
  try {
    data = await response.json();
  } catch (err) {
    resultContent.innerHTML = "<p>Invalid server response.</p>";
    return;
  }

  if (data.error) {
    resultContent.innerHTML = `<p>${data.error}</p>`;
    return;
  }

  // Likelihood bar
  const likelihoodBar = `
    <div class="likelihood-bar">
      <div class="likelihood-fill" style="width:${data.score}%"></div>
      <span class="likelihood-label">${data.score}% likelihood</span>
    </div>
  `;

  // Render result
  resultContent.innerHTML = `
    <h3 class="verdict-pill">${data.verdict}</h3>

    ${likelihoodBar}

    <p>${data.assessment}</p>

    <h3>Potential Positive Factors</h3>
    <ul>
      ${data.positives.length ? data.positives.map(p => `<li>${p}</li>`).join("") : "<li>No specific positive indicators noted.</li>"}
    </ul>

    <h3>Key Risks</h3>
    <ul>
      ${data.risks.length ? data.risks.map(r => `<li>${r}</li>`).join("") : "<li>No major risks identified.</li>"}
    </ul>

    <h3>Professional Assessment</h3>
    <p>${data.professional}</p>

    <h3>Recommendation</h3>
    <p>${data.recommendation}</p>

    <h3>Location Context</h3>
    <p><strong>Town:</strong> ${data.town}</p>
    <p><strong>Local Authority:</strong> ${data.authority}</p>
    <p><strong>Nation:</strong> ${data.nation}</p>

    <p class="disclaimer">
      This automated assessment provides an initial indication only.
      Walker Planning can provide a formal planning appraisal if required.
    </p>
  `;

  resultLocked = false;
});
