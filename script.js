// ------------------------------------------------------
// CONFIG — DEV OR PRODUCTION WORKER
// ------------------------------------------------------
const workerURL = "https://walker-planning-worker-dev.emichops.workers.dev/";
// For production: 
// const workerURL = "https://walker-planning-worker.emichops.workers.dev/";


document.addEventListener("DOMContentLoaded", () => {
  const projectType = document.getElementById("projectType");
  const dimFields = document.getElementById("dimension-fields");
  const checkBtn = document.getElementById("checkBtn");

  projectType.addEventListener("change", renderDimensions);
  checkBtn.addEventListener("click", runCheck);

  function renderDimensions() {
    const type = projectType.value;
    let html = "";

    const needsDims = {
      "rear-extension": true,
      "side-extension": true,
      "wrap-extension": true,
      "two-storey": true,
      "garden-outbuilding": true
    };

    if (needsDims[type]) {
      html = `
        <label>Projection (metres)</label>
        <input type="number" id="projection" min="0" step="0.1" />

        <label>Height (metres)</label>
        <input type="number" id="height" min="0" step="0.1" />

        <label>Distance to boundary (metres)</label>
        <input type="number" id="boundary" min="0" step="0.1" />
      `;
    }

    dimFields.innerHTML = html;
  }

  async function runCheck() {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const projectTypeVal = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value === "yes";

    // Postcode validation
    const pcValid = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
    if (!pcValid.test(postcode)) {
      alert("Please enter a valid UK postcode.");
      return;
    }

    if (!propertyType || !projectTypeVal) {
      alert("Please complete all required fields.");
      return;
    }

    let dimensions = {};
    if (document.getElementById("projection")) {
      dimensions = {
        projection: Number(document.getElementById("projection").value || 0),
        height: Number(document.getElementById("height").value || 0),
        boundary: Number(document.getElementById("boundary").value || 0)
      };
    }

    const payload = {
      postcode,
      propertyType,
      projectType: projectTypeVal,
      areaStatus,
      listedStatus: listed ? "yes" : "no",
      dimensions
    };

    const res = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    renderResults(json);
  }

  function sectionHTML(title, body) {
    return `
      <h3 class="section-title">${title}</h3>
      <p>${body}</p>
    `;
  }

  function renderResults(data) {
    const card = document.getElementById("resultsCard");

    // Decision pill
    document.getElementById("decisionPill").innerHTML =
      `<span class="pill ${data.decision}">${data.decision_label}</span>`;

    document.getElementById("resultSummary").textContent = data.summary;

    // Narrative blocks
    const n = data.narrative || {};

    document.getElementById("introSection").innerHTML =
      sectionHTML("Introduction", n.intro || "");

    document.getElementById("proposalSection").innerHTML =
      sectionHTML("About Your Proposal", n.project_summary || "");

    document.getElementById("pdContextSection").innerHTML =
      sectionHTML("Permitted Development Assessment", n.pd_context || "");

    // Risks
    let risksHTML = "";
    if (data.keyRisks?.length) {
      risksHTML = `
        <h3 class="section-title">Key Risks</h3>
        <ul>${data.keyRisks.map(r => `<li>${r}</li>`).join("")}</ul>
      `;
    }
    document.getElementById("riskSection").innerHTML = risksHTML;

    // Recommendations
    const rec = n.recommendations || {};
    document.getElementById("recommendSection").innerHTML = `
      <h3 class="section-title">Next Recommended Steps</h3>
      <p><strong>Permitted development route:</strong> ${rec.pd_path || ""}</p>
      <p><strong>Planning application route:</strong> ${rec.planning_path || ""}</p>
    `;

    // Conclusion
    document.getElementById("conclusionSection").innerHTML =
      sectionHTML("Conclusion", n.conclusion || "");

    card.style.display = "block";
    card.scrollIntoView({ behavior: "smooth" });
  }
});