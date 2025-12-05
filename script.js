/* ============================================================
   DOM ELEMENTS
============================================================ */
const form = document.getElementById("form");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

const projectTypeSelect = document.getElementById("projectType");
const dimensionsFieldsContainer = document.getElementById("dimensionFieldsContainer");

/* ============================================================
   DYNAMIC DIMENSION RULES
============================================================ */
const dimensionRules = {
  "Rear extension": ["projection", "height", "distance"],
  "Side extension": ["width", "height", "projection"],
  "Loft conversion": ["rearDormer", "volume"],
  "Dormer": ["projection", "height"],
  "Porch": ["projection", "height"],
  "Garage conversion": [],
  "Outbuilding": ["height", "area"],
  "Wrap-around extension": ["projection", "sideWidth"],
};

/* ============================================================
   RENDER DYNAMIC FIELDS
============================================================ */
function renderDimensionFields(projectType) {
  dimensionsFieldsContainer.innerHTML = "";
  const fields = dimensionRules[projectType] || [];
  fields.forEach(f => {
    const label = f.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.1";
    input.min = "0";
    input.id = f;
    input.placeholder = label;
    input.className = "dynamic-input";
    dimensionsFieldsContainer.appendChild(input);
  });
}

if (projectTypeSelect) {
  projectTypeSelect.addEventListener("change", () => {
    renderDimensionFields(projectTypeSelect.value);
  });
}

/* ============================================================
   FORM SUBMISSION
============================================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loader immediately
  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  spinner.innerHTML = `<div class="dot-loader"><div></div><div></div><div></div></div>`;
  resultContent.innerHTML = "";

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

  // BUILD PAYLOAD
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: projectTypeSelect.value.trim(),
    areaStatus: document.getElementById("areaStatus").value.trim(),
    propertyStatus: document.getElementById("propertyStatus").value.trim(),
    description: document.getElementById("description")?.value || "",
    dimensions: {}
  };

  const dimKeys = dimensionRules[payload.projectType] || [];
  dimKeys.forEach(k => {
    const el = document.getElementById(k);
    if (el && el.value) payload.dimensions[k] = parseFloat(el.value);
  });

  // SEND TO WORKER
  let response;
  try {
    response = await fetch(
      "https://walker-planning-feasibility-tool.walkerplanning.workers.dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Network error.</p>`;
    return;
  }

  const data = await response.json();
  spinner.classList.add("hidden");

  // RENDER RESULT
  resultContent.innerHTML = `
    <div class="fade-in">

      <div class="verdict-pill verdict-${data.score >= 70 ? "allowed" : data.score >= 40 ? "uncertain" : "refused"}">
        ${data.verdict}
      </div>

      <h3>PD Confidence</h3>
      <p><strong>${data.score}% likelihood</strong></p>

      <h3>Summary</h3>
      <p>This assessment is based on ${data.nation} PD rules and ${data.authority} planning context.</p>

      <h3>Key Benefits</h3>
      <ul>${data.benefits.map(b => `<li>${b}</li>`).join("")}</ul>

      <h3>Key Risks</h3>
      <ul>${data.risks.map(r => `<li>${r}</li>`).join("")}</ul>

      <h3>Professional Assessment</h3>
      <p>${data.assessment}</p>

      <h3>Recommendation</h3>
      <p>${data.recommendation}</p>

      <h3>Location Context</h3>
      <p><strong>Local Authority:</strong> ${data.authority}</p>
      <p><strong>Nation:</strong> ${data.nation}</p>

      <p class="disclaimer">
        This automated tool provides an early feasibility review. Planning rules vary locally — confirm exact constraints with your local authority or a qualified planner.
      </p>
    </div>
  `;

  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});
