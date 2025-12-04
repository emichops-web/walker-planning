/* -------------------------------
   DIMENSION RULES (Option A)
------------------------------- */
const dimensionRules = {
  "Rear extension": ["projection", "height", "boundary"],
  "Side extension": ["projection", "height", "boundary"],
  "Wrap-around extension": ["projection", "height", "boundary"],
  "Porch / front extension": ["projection", "height"],
  "Loft dormer extension": ["projection", "height"],
  "Roof lights": ["projection"],
  "Single-storey outbuilding": ["projection", "height", "boundary"],
  "Two-storey extension": ["projection", "height", "boundary"]
};

/* DOM ELEMENTS */
const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const projectTypeSelect = document.getElementById("projectType");
const dimensionFieldsContainer = document.getElementById("dimensionFields");

/* -------------------------------
   RENDER DYNAMIC DIMENSIONS
------------------------------- */
function renderDimensions(type) {
  const fields = dimensionRules[type] || [];
  dimensionFieldsContainer.innerHTML = "";

  fields.forEach(field => {
    let label = "";
    let placeholder = "Enter value";

    switch (field) {
      case "projection": label = "Projection (m) *"; placeholder = "e.g., 3"; break;
      case "height": label = "Height (m) *"; placeholder = "e.g., 2.5"; break;
      case "boundary": label = "Distance to boundary (m) *"; placeholder = "e.g., 2"; break;
    }

    dimensionFieldsContainer.innerHTML += `
      <div class="dimension-item">
        <label>${label}</label>
        <input id="${field}" type="number" step="0.1" min="0" required placeholder="${placeholder}">
      </div>
    `;
  });
}

renderDimensions(projectTypeSelect.value);
projectTypeSelect.addEventListener("change", () => {
  renderDimensions(projectTypeSelect.value);
});

/* -------------------------------
     FORM SUBMISSION
------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `<div class="loader"></div>`;

  resultCard.scrollIntoView({ behavior: "smooth" });

  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    projection: document.getElementById("projection")?.value || "",
    height: document.getElementById("height")?.value || "",
    boundary: document.getElementById("boundary")?.value || "",
    constraints: document.getElementById("constraints").value
  };

  try {
    const response = await fetch("https://walker-planning-worker.emichops.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (json.error) {
      resultContent.innerHTML = `<p style="color:red;">${json.error}</p>`;
      return;
    }

    resultContent.innerHTML = `
      ${json.conclusion_html}
      ${json.summary_html}
      ${json.details_html}
    `;
  } catch (err) {
    resultContent.innerHTML = `<p style="color:red;">Request failed: ${err.message}</p>`;
  }
});
