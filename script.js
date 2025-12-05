document.addEventListener("DOMContentLoaded", () => {
  const projectTypeSelect = document.getElementById("projectType");
  const dimensionsContainer = document.getElementById("dimensionsContainer");
  const resultContent = document.getElementById("resultContent");
  const form = document.getElementById("pdForm");
  const loader = document.getElementById("loader");

  // --------------------------
  // Dynamic dimension handling
  // --------------------------

  const dimensionMap = {
    "Rear extension": ["projection", "height", "boundary"],
    "Side extension": ["projection", "height", "boundary"],
    "Wrap-around extension": ["projection", "height", "boundary"],
    "Porch / front extension": ["projection", "height"],
    "Two-storey extension": ["projection", "height", "boundary"],
    "Garden room / outbuilding": ["projection", "height"],
    "Garage conversion": [],
    "Loft conversion": [],
    "Dormer extension": ["projection", "height"],
    "Annexe / outbuilding": ["projection", "height", "boundary"]
  };

  function renderDimensionFields(type) {
    dimensionsContainer.innerHTML = "";
    const fields = dimensionMap[type] || [];

    fields.forEach((f) => {
      const label = f === "projection" ? "Projection (m)" :
                    f === "height" ? "Height (m)" :
                    "Distance to boundary (m)";

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.1";
      input.id = f;
      input.placeholder = label;
      input.className = "form-input";

      const wrapper = document.createElement("div");
      wrapper.className = "input-wrapper";
      wrapper.appendChild(input);

      dimensionsContainer.appendChild(wrapper);
    });
  }

  projectTypeSelect.addEventListener("change", () => {
    renderDimensionFields(projectTypeSelect.value);
  });

  // --------------------------
  // Form submission
  // --------------------------

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loader.style.display = "block";
    resultContent.innerHTML = "";

    const payload = {
      postcode: document.getElementById("postcode").value.trim(),
      propertyType: document.getElementById("propertyType").value.trim(),
      projectType: projectTypeSelect.value.trim(),
      areaStatus: document.getElementById("areaStatus").value.trim(),
      propertyStatus: document.getElementById("propertyStatus").value.trim(),
      description: document.getElementById("description").value.trim(),
      dimensions: {}
    };

    // Grab dynamic dimensions
    (dimensionMap[payload.projectType] || []).forEach((f) => {
      const v = document.getElementById(f)?.value.trim();
      if (v !== "" && !isNaN(v)) payload.dimensions[f] = parseFloat(v);
    });

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      loader.style.display = "none";

      if (!data || typeof data !== "object" || !data.verdict) {
        resultContent.innerHTML = `<p>Unexpected response format.</p>`;
        return;
      }

      renderReport(data);

      resultContent.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      loader.style.display = "none";
      resultContent.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  });

  // --------------------------
  // REPORT RENDERING
  // --------------------------

  function renderReport(data) {
    const score = data.score ?? 0;

    const scoreBar = `
      <div class="score-bar-container">
        <div class="score-bar-fill" style="width: ${score}%"></div>
      </div>
      <p class="score-label">${score}% likelihood</p>
    `;

    const positives = data.positives?.length
      ? data.positives.map(p => `<li>${p}</li>`).join("")
      : "<li>No clear positive factors identified.</li>";

    const risks = data.risks?.length
      ? data.risks.map(r => `<li>${r}</li>`).join("")
      : "<li>No significant risks identified from available information.</li>";

    const town = data.town && data.town !== "your area"
      ? data.town
      : "your local area";

    const verdictClass =
      data.verdict.includes("advised") ? "verdict-bad" :
      data.verdict.includes("Uncertain") ? "verdict-mid" : "verdict-good";

    resultContent.innerHTML = `
      <div class="verdict-pill ${verdictClass}">
        ${data.verdict}
      </div>

      <h3>Permitted Development Confidence</h3>
      ${scoreBar}

      <h3>Summary</h3>
      <p>${data.assessment}</p>

      <h3>Potential Positive Factors</h3>
      <ul>${positives}</ul>

      <h3>Key Risks</h3>
      <ul>${risks}</ul>

      <h3>Professional Assessment</h3>
      <p>${data.professional}</p>

      <h3>Recommendation</h3>
      <p>${data.recommendation}</p>

      <h3>Location Context</h3>
      <p><strong>Town:</strong> ${town}</p>
      <p><strong>Local Authority:</strong> ${data.authority}</p>
      <p><strong>Nation:</strong> ${data.nation}</p>

      <p class="note">
        Note: This automated assessment provides an initial indication only.
        Walker Planning can provide a formal planning appraisal if required.
      </p>
    `;
  }
});
