// ===============================
// ELEMENT REFERENCES
// ===============================
const form = document.getElementById("pdForm");
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

let resultLocked = false;

// ===============================
// DIMENSION RULES
// ===============================
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["projection", "height"],
  "Porch": ["projection", "height"],
  "Garage conversion": [],
  "Loft conversion": ["height"],
  "Garden room": ["projection", "height", "boundary"]
};

// ===============================
// RENDER DIMENSIONS
// ===============================
function renderDimensionFields(projectType) {
  if (resultLocked) return;

  dimensionFieldsContainer.innerHTML = "";
  const fields = dimensionRules[projectType] || [];

  fields.forEach(f => {
    const label = f === "projection" ? "Projection (m)" :
                  f === "height" ? "Height (m)" :
                  f === "boundary" ? "Distance to boundary (m)" : f;

    const id = `dim_${f}`;
    const html = `
      <label>${label} *</label>
      <input type="number" step="0.1" id="${id}" required />
    `;
    const div = document.createElement("div");
    div.innerHTML = html;
    dimensionFieldsContainer.appendChild(div);
  });
}

projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

// ===============================
// FORM SUBMIT
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultLocked = true;

  // Show card + loader
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `<div class="dot-loader"><div></div><div></div><div></div></div>`;
  resultContent.innerHTML = "";

  // Scroll to loader immediately
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // Build payload
  const payload = {
    postcode: document.getElementById("postcode")?.value.trim(),
    propertyType: document.getElementById("propertyType")?.value.trim(),
    projectType: projectTypeSelect.value.trim(),
    areaStatus: document.getElementById("areaStatus")?.value.trim(),
    propertyStatus: document.getElementById("propertyStatus")?.value.trim(),
    description: document.getElementById("description")?.value || "",
    dimensions: {}
  };

  // Collect dimension values
  const allDims = dimensionRules[payload.projectType] || [];
  allDims.forEach(f => {
    const id = `dim_${f}`;
    payload.dimensions[f] = document.getElementById(id)?.value || null;
  });

  // POST to Worker
  let apiResponse;
  try {
    const res = await fetch("/worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    apiResponse = await res.json();
  } catch (err) {
    resultContent.innerHTML = `<p style="color:red;">Server error – please try again.</p>`;
    spinner.classList.add("hidden");
    return;
  }

  // Hide loader
  spinner.classList.add("hidden");

  // Render results
  if (apiResponse.error) {
    resultContent.innerHTML = `<p style="color:red;">${apiResponse.error}</p>`;
    return;
  }

  resultContent.innerHTML = `
    ${apiResponse.verdictHTML}

    <p>${apiResponse.summary}</p>

    <h3>PD Likelihood:</h3>
    <p><strong>${apiResponse.pdScore}% confidence</strong></p>

    <h3>Risk Factors</h3>
    <ul>
      ${
        apiResponse.riskFactors.length
          ? apiResponse.riskFactors.map(r => `<li>${r}</li>`).join("")
          : "<li>No major risks identified.</li>"
      }
    </ul>

    <h3>Additional Notes</h3>
    ${apiResponse.additionalNotes}

    <h3>Constraint Interpretation</h3>
    ${apiResponse.constraintHTML}

    <p class="disclaimer">
      <strong>Disclaimer:</strong> This automated tool provides a general overview only.
      Always confirm constraints with your local authority or a qualified planner.
    </p>
  `;

  // Final scroll
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  resultLocked = false;
});
