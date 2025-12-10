const workerURL = "https://walker-planning-worker-dev.emichops.workers.dev/";

document.addEventListener("DOMContentLoaded", () => {
  const dimFields = document.getElementById("dimension-fields");
  const projectTypeSelect = document.getElementById("projectType");
  const checkBtn = document.getElementById("checkBtn");

  projectTypeSelect.addEventListener("change", renderDimensions);
  checkBtn.addEventListener("click", runCheck);

  function readableProjectType(raw) {
  return raw.replace(/-/g, " ");
}

function readableProjectTypeForWorker(raw) {
  return raw.replace(/-/g, "_");
}

function readablePropertyType(p) {
  if (!p) return "";
  const lower = p.toLowerCase();
  if (lower === "detached") return "detached house";
  if (lower === "semi-detached") return "semi-detached house";
  if (lower === "terraced") return "terraced house";
  return lower;
}


  function renderDimensions() {
    const type = projectTypeSelect.value;
    const needsDims = {
      "rear-extension": true,
      "side-extension": true,
      "wrap-extension": true,
      "two-storey": true,
      "garden-outbuilding": true
    };

    dimFields.innerHTML = needsDims[type]
      ? `
        <label>Projection (metres)</label>
        <input type="number" id="projection" min="0" step="0.1">

        <label>Height (metres)</label>
        <input type="number" id="height" min="0" step="0.1">

        <label>Distance to boundary (metres)</label>
        <input type="number" id="boundary" min="0" step="0.1">
        `
      : "";
  }

  async function runCheck() {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const projectType = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value;

    // Validate postcode
    const pcValid = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
    if (!pcValid.test(postcode)) {
      alert("Please enter a valid UK postcode.");
      return;
    }

    let dimensions = {};
    if (document.getElementById("projection")) {
      dimensions = {
        projection: Number(document.getElementById("projection").value),
        height: Number(document.getElementById("height").value),
        boundary: Number(document.getElementById("boundary").value)
      };
    }

    const payload = {
      postcode,
      propertyType: readablePropertyType(propertyType),
      projectType: readableProjectTypeForWorker(projectType),
      areaStatus,
      listedStatus: listed,
      dimensions
    };

    const res = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    renderResults(data);
  }

  function renderResults(d) {
    const card = document.getElementById("resultsCard");
    card.classList.remove("hidden");

    document.getElementById("resultLocation").textContent = d.summary;
    document.getElementById("professionalAssessment").textContent =
      d.professionalAssessment;

    // Decision pill under Professional Planning Assessment
    document.getElementById("decisionPill").innerHTML = `
      <span class="pill ${d.decision}">${d.decision_label}</span>
    `;

    // Narrative mapping
    const n = d.narrative || {};
  // --- Fix property type wording inside narrative text ---
if (n.intro) {
  const cleanProp = readablePropertyType(d.propertyType || "");
  n.intro = n.intro.replace(
    /your (detached|semi[- ]?detached|terraced)/i,
    `your ${cleanProp}`
  );
}

document.getElementById("overview").innerHTML = n.intro || "";
    document.getElementById("proposal").innerHTML = n.project_summary || "";
    document.getElementById("pdContext").innerHTML = n.pd_context || "";
    document.getElementById("conclusion").innerHTML = n.conclusion || "";

    // Risks list
    const risksList = document.getElementById("risksList");
    risksList.innerHTML = "";
    (d.keyRisks || []).forEach(r => {
      const li = document.createElement("li");
      li.textContent = r;
      risksList.appendChild(li);
    });

    // Recommendations list
    const recList = document.getElementById("recommendationsList");
    recList.innerHTML = "";
    if (n.recommendations) {
      if (n.recommendations.pd_path) {
        const li = document.createElement("li");
        li.textContent = n.recommendations.pd_path;
        recList.appendChild(li);
      }
      if (n.recommendations.planning_path) {
        const li = document.createElement("li");
        li.textContent = n.recommendations.planning_path;
        recList.appendChild(li);
      }
    }

    card.scrollIntoView({ behavior: "smooth" });
  }
});