// -----------------------------
// DIMENSION RULES (unchanged)
// -----------------------------
const dimensionRules = {
  "Rear extension": ["projection", "height", "distance"],
  "Side extension": ["projection", "height", "distance"],
  "Wrap-around extension": ["projection", "height", "distance"],
  "Front / porch extension": ["projection", "height", "distance"],
  "Two-storey extension": ["projection", "height", "distance"],
  "Roof / loft conversion": ["projection", "height", "distance"],
  "Hip-to-gable roof extension": ["projection", "height", "distance"],
  "Dormer extension": ["projection", "height", "distance"],
  "Flat roof extension": ["projection", "height", "distance"],
  "Single-storey outbuilding": ["projection", "height", "distance"],
  "Two-storey outbuilding": ["projection", "height", "distance"],
  "Garage conversion": [],
  "Windows / doors": [],
  "Solar panels": ["projection"],
  "Fencing / gates": ["height"]
};

// -----------------------------
// FORM ELEMENTS
// -----------------------------
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

// -----------------------------
// RENDER DIMENSION FIELDS
// -----------------------------
function renderDimensionFields(projectType) {
  const fields = dimensionRules[projectType] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    const labelMap = {
      projection: "Projection (m)",
      height: "Height (m)",
      distance: "Distance to nearest boundary (m)"
    };

    const div = document.createElement("div");
    div.classList.add("form-group");

    div.innerHTML = `
      <label>${labelMap[field]} *</label>
      <input type="number" step="0.1" min="0" id="${field}" required>
    `;

    dimensionFieldsContainer.appendChild(div);
  });
}

// Trigger field rendering on load + change
renderDimensionFields(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

// -----------------------------
// HANDLE FORM SUBMIT
// -----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.innerHTML = "";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: projectTypeSelect.value.trim(),
    areaStatus: document.getElementById("areaStatus").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    description: document.getElementById("description")?.value || "",
    dimensions: {}
  };

  // Add dimension values
  (dimensionRules[payload.projectType] || []).forEach(field => {
    const el = document.getElementById(field);
    if (el) payload.dimensions[field] = el.value;
  });

  // Post to Worker
  let response;
  try {
    response = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red;">Network error. Please try again.</p>`;
    return;
  }

  const data = await response.json();

  // Hide loader
  spinner.classList.add("hidden");

  if (data.error) {
    resultContent.innerHTML =
      `<p style="color:red; font-weight:bold;">${data.error}</p>`;
    return;
  }

  // ---------------------------------------
  // Render the result report (NEW TEMPLATE)
  // ---------------------------------------
  resultContent.innerHTML = `
    <div class="fade-in">

      ${data.conclusion_html || ""}

      <p class="result-summary">${data.summary_html || ""}</p>

      <h3>PD Confidence</h3>
      <p><strong>${data.pdScore || "N/A"}%</strong> likelihood</p>

      <h3>Summary</h3>
      <p>${data.plannerSummary || ""}</p>

      <h3>Key Benefits</h3>
      <ul>
        ${(data.keyBenefits || []).map(b => `<li>${b}</li>`).join("")}
      </ul>

      <h3>Key Risks</h3>
      <ul>
        ${(data.keyRisks || []).map(r => `<li>${r}</li>`).join("")}
      </ul>

      <h3>Professional Assessment</h3>
      <p>${data.professionalAssessment || ""}</p>

      <h3>Recommendation</h3>
      <p>${data.recommendation || ""}</p>

      <h3>Local Authority</h3>
      <p>${data.authority || "Unknown"}</p>
    </div>
  `;

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});
