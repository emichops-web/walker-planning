const workerURL = "https://walker-planning-worker-dev.emichops.workers.dev/";

document.addEventListener("DOMContentLoaded", () => {
  const projectType = document.getElementById("projectType");
  const dimFields = document.getElementById("dimension-fields");
  const checkBtn = document.getElementById("checkBtn");

  projectType.addEventListener("change", renderDimensions);
  checkBtn.addEventListener("click", runCheck);

  /* ===============================
     DYNAMIC DIMENSIONS
  =============================== */
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
        <input type="number" id="projection" min="0" step="0.1">

        <label>Height (metres)</label>
        <input type="number" id="height" min="0" step="0.1">

        <label>Distance to boundary (metres)</label>
        <input type="number" id="boundary" min="0" step="0.1">
      `;
    }

    dimFields.innerHTML = html;
  }

  /* ===============================
     RUN CHECK
  =============================== */
  async function runCheck() {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value;
    const projectTypeVal = document.getElementById("projectType").value;
    const areaStatus = document.getElementById("areaStatus").value;
    const listed = document.getElementById("listed").value === "yes";

    // Basic postcode validation
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
      const proj = Number(document.getElementById("projection").value);
      const h = Number(document.getElementById("height").value);
      const b = Number(document.getElementById("boundary").value);

      if (!proj || !h || !b) {
        alert("Please enter all dimension fields.");
        return;
      }

      dimensions = { projection: proj, height: h, boundary: b };
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

  /* ===============================
     RENDER RESULTS
  =============================== */
  function renderResults(data) {
    const resultsCard = document.getElementById("resultsCard");

    /* --- Decision pill --- */
    const pill = document.getElementById("decisionPill");
    pill.innerHTML = `<span class="pill ${data.decision}">${data.decision_label}</span>`;

    /* --- Overview --- */
    const overviewText = document.getElementById("resultSummary");
    overviewText.textContent = data.summary || "";

    /* --- Narrative blocks --- */
    const narrative = data.narrative || {};

    setBlock("narrativeIntro", narrative.intro);
    setBlock("narrativeProject", narrative.project_summary);
    setBlock("narrativeContext", narrative.pd_context);

    /* --- Risks --- */
    const riskBlock = document.getElementById("risksBlock");
    if (data.keyRisks && data.keyRisks.length > 0) {
      riskBlock.innerHTML = `
        <h3>Key Risks</h3>
        <ul>${data.keyRisks.map(r => `<li>${r}</li>`).join("")}</ul>
      `;
    } else {
      riskBlock.innerHTML = "";
    }

    /* --- Positives --- */
    const posBlock = document.getElementById("positivesBlock");
    if (data.positive && data.positive.length > 0) {
      posBlock.innerHTML = `
        <h3>Positive Findings</h3>
        <ul>${data.positive.map(p => `<li>${p}</li>`).join("")}</ul>
      `;
    } else {
      posBlock.innerHTML = "";
    }

    /* --- Recommendations --- */
    const recBlock = document.getElementById("recommendations");
    const recs = narrative.recommendations || {};

    let recText = "";
    if (recs.pd_path) recText += `<p>${recs.pd_path}</p>`;
    if (recs.planning_path) recText += `<p>${recs.planning_path}</p>`;

    recBlock.innerHTML = recText || "<p>No specific recommendations provided.</p>";

    /* --- Conclusion --- */
    setBlock("finalConclusion", narrative.conclusion);

    /* --- Show + scroll --- */
    resultsCard.style.display = "block";
    resultsCard.scrollIntoView({ behavior: "smooth" });
  }

  /* ===============================
     HELPERS
  =============================== */
  function setBlock(id, text) {
    const el = document.getElementById(id);
    if (text && text.trim()) {
      el.parentElement.style.display = "block";
      el.innerHTML = text;
    } else {
      el.parentElement.style.display = "none";
    }
  }
});