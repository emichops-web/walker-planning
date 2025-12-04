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
  "Fencing / gates": ["height"]
};

/* DOM ELEMENTS */
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

/* RENDER DIMENSION FIELDS */
function renderDimensionFields(type) {
  const fields = dimensionRules[type] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "";

    switch (field) {
      case "projection": label = "Projection (m) *"; placeholder = "e.g., 3"; break;
      case "width": label = "Width (m) *"; placeholder = "e.g., 2.5"; break;
      case "height": label = "Height (m) *"; placeholder = "e.g., 3"; break;
      case "boundaryDistance": label = "Distance to boundary (m) *"; placeholder = "e.g., 2"; break;
      case "dormerVolume": label = "Dormer volume (m³) *"; placeholder = "e.g., 40"; break;
      case "newRidge": label = "New ridge height (m) *"; placeholder = "e.g., 6.2"; break;
      case "footprint": label = "Footprint (m²) *"; placeholder = "e.g., 25"; break;
    }

    const el = document.createElement("div");
    el.classList.add("dimension-item");

    el.innerHTML = `
      <label>${label}</label>
      <input type="number" step="0.1" id="${field}" placeholder="${placeholder}" required>
    `;

    dimensionFieldsContainer.appendChild(el);
  });
}

renderDimensionFields(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => {
  renderDimensionFields(projectTypeSelect.value);
});

/* -------------------------------
  AUTO SCROLL FUNCTION
------------------------------- */
function scrollToResults() {
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* -------------------------------
  SUBMIT HANDLER
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* SHOW LOADER */
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = "";
  spinner.classList.remove("hidden");

  scrollToResults(); // now scroll immediately when loader appears

  /* BUILD PAYLOAD */
  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value.trim(),
    projectType: document.getElementById("projectType").value.trim(),
    constraints: document.getElementById("constraints").value.trim(),
    projectDescription: document.getElementById("projectDescription").value.trim(),
    dimensions: {}
  };

  const rules = dimensionRules[payload.projectType] || [];
  for (const r of rules) {
    const el = document.getElementById(r);
    if (!el || !el.value.trim()) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = "<p style='color:red'>Missing required dimensions.</p>";
      return;
    }
    payload.dimensions[r] = el.value.trim();
  }

  /* SEND TO WORKER */
  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    spinner.classList.add("hidden");

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    /* DISPLAY AI RESULT */
    resultContent.innerHTML = `
      <div class="fade-in">
        ${data.conclusion_html || ""}
        ${data.summary_html || ""}
        ${data.details_html || ""}
      </div>
    `;

    scrollToResults(); // scroll again after content is ready

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Request failed: ${err.message}</p>`;
  }
});
