document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("planningForm");
  const resultCard = document.getElementById("resultCard");
  const resultContent = document.getElementById("resultContent");
  const spinner = document.getElementById("spinner");

  /* ---------------------------
     Dimension Field Rendering
  ----------------------------*/
  const dimensionMap = {
    "Rear extension": ["projection", "height", "boundary"],
    "Side extension": ["projection", "height", "width"],
    "Loft conversion": ["height", "volume"],
    "Garden room": ["projection", "height", "boundary"]
  };

  const dimensionLabels = {
    projection: "Projection (m)",
    height: "Height (m)",
    boundary: "Distance to nearest boundary (m)",
    width: "Width (m)",
    volume: "Roof volume increase (m³)"
  };

  const dimensionContainer = document.getElementById("dimensionFields");
  const projectTypeSelect = document.getElementById("projectType");

  function renderDimensionFields() {
    const selected = projectTypeSelect.value;
    const dims = dimensionMap[selected] || [];
    dimensionContainer.innerHTML = "";

    dims.forEach(key => {
      const wrapper = document.createElement("div");
      wrapper.className = "input-group";

      wrapper.innerHTML = `
        <label>${dimensionLabels[key]} *</label>
        <input type="number" step="0.1" min="0" id="dim_${key}" required />
      `;

      dimensionContainer.appendChild(wrapper);
    });
  }

  projectTypeSelect.addEventListener("change", renderDimensionFields);
  renderDimensionFields();

  /* ---------------------------
     HANDLE FORM SUBMIT
  ----------------------------*/
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show loader immediately
    resultCard.classList.remove("hidden");
    spinner.classList.remove("hidden");
    resultContent.innerHTML = "";

    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });

    // Build dimensions payload
    const dims = {};
    document.querySelectorAll("#dimensionFields input").forEach(input => {
      dims[input.id.replace("dim_", "")] = parseFloat(input.value);
    });

    const payload = {
      postcode: document.getElementById("postcode").value.trim(),
      propertyType: document.getElementById("propertyType").value.trim(),
      projectType: projectTypeSelect.value.trim(),
      areaStatus: document.getElementById("areaStatus").value.trim(),
      propertyStatus: document.getElementById("propertyStatus").value.trim(),
      description: document.getElementById("description").value || "",
      dimensions: dims
    };

    try {
      const res = await fetch("https://walker-planning-worker.emichops.workers.dev", {
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

      /* ---------------------------
         Render Report
      ----------------------------*/
      let html = `
        <div class="fade-in">

          <div class="verdict-pill ${pillClass(data.score)}">
            ${data.verdict}
          </div>

          <h3>PD Confidence</h3>
          <p><strong>${data.score}% likelihood</strong></p>

          <h3>Summary</h3>
          <p>${data.summary}</p>

          <h3>Key Benefits</h3>
          <ul>
            ${data.benefits.length ? data.benefits.map(b => `<li>${b}</li>`).join("") : "<li>No major benefits identified.</li>"}
          </ul>

          <h3>Key Risks</h3>
          <ul>
            ${data.risks.length ? data.risks.map(r => `<li>${r}</li>`).join("") : "<li>No significant risks identified.</li>"}
          </ul>

          <h3>Professional Assessment</h3>
          <p>${data.assessment}</p>

          <h3>Recommendation</h3>
          <p>${data.recommendation}</p>

          <h3>Local Authority</h3>
          <p>${data.authority}</p>

          <h3>Nation</h3>
          <p>${data.nation}</p>
        </div>
      `;

      resultContent.innerHTML = html;

    } catch (err) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
  });

  function pillClass(score) {
    if (score >= 70) return "verdict-allowed";
    if (score >= 40) return "verdict-uncertain";
    return "verdict-refused";
  }
});
