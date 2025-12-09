// -----------------------------
// Dynamic dimension rendering
// -----------------------------
const projectType = document.getElementById("projectType");
const dimensionFields = document.getElementById("dimension-fields");

projectType.addEventListener("change", () => {
    const type = projectType.value;
    let html = "";

    const needsAll = [
        "rear-extension",
        "side-extension",
        "wrap-extension",
        "two-storey",
        "front-porch",
        "annexe"
    ];

    const needsHB = [
        "dormer",
        "loft",
        "garden-outbuilding"
    ];

    if (needsAll.includes(type)) {
        html = `
            <label>Projection (m)</label>
            <input id="projection" type="number" step="0.1" />

            <label>Height (m)</label>
            <input id="height" type="number" step="0.1" />

            <label>Nearest boundary distance (m)</label>
            <input id="boundary" type="number" step="0.1" />
        `;
    }
    else if (needsHB.includes(type)) {
        html = `
            <label>Height (m)</label>
            <input id="height" type="number" step="0.1" />

            <label>Nearest boundary distance (m)</label>
            <input id="boundary" type="number" step="0.1" />
        `;
    }
    else {
        html = "";
    }

    dimensionFields.innerHTML = html;
});


// -----------------------------
// Submit request to Worker
// -----------------------------
document.getElementById("runCheck").addEventListener("click", async () => {

    const payload = {
        postcode: document.getElementById("postcode").value.trim(),
        propertyType: document.getElementById("propertyType").value,
        projectType: projectType.value,
        areaStatus: document.getElementById("areaStatus").value,
        propertyStatus: document.getElementById("propertyStatus").value,
        description: document.getElementById("description").value.trim(),
        dimensions: {}
    };

    const projEl = document.getElementById("projection");
    const heightEl = document.getElementById("height");
    const boundaryEl = document.getElementById("boundary");

    payload.dimensions = {
        projection: projEl ? parseFloat(projEl.value) || 0 : 0,
        height: heightEl ? parseFloat(heightEl.value) || 0 : 0,
        boundary: boundaryEl ? parseFloat(boundaryEl.value) || 0 : 0
    };

    // 🔧 UPDATE THIS TO YOUR PROD WORKER WHEN READY
    const WORKER_URL = "https://walker-planning-worker-dev.emichops.workers.dev";

    const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    const box = document.getElementById("result-card");
    const content = document.getElementById("result-content");

    // safe fallback arrays
    const positives = Array.isArray(data.positive) ? data.positive : [];
    const risks = Array.isArray(data.risks) ? data.risks : [];

    content.innerHTML = `
        <div id="result-banner" class="result-banner ${data.decision}">
            ${data.decision_label}
        </div>

        <h3>Summary</h3>
        <p>${data.summary || "No summary available."}</p>

        <h3>Positive Factors</h3>
        ${positives.length
            ? `<ul>${positives.map(x => `<li>${x}</li>`).join("")}</ul>`
            : "<p>No specific positive factors identified.</p>"}

        <h3>Key Risks</h3>
        ${risks.length
            ? `<ul>${risks.map(x => `<li>${x}</li>`).join("")}</ul>`
            : "<p>No specific risks identified.</p>"}

        <h3>Professional Assessment</h3>
        <p>${data.professional || "A planning officer should review this proposal."}</p>

        <h3>Location</h3>
        <p><strong>Town:</strong> ${data.town || "Unknown"}</p>
        <p><strong>Authority:</strong> ${data.authority || "Unknown"}</p>
        <p><strong>Nation:</strong> ${data.nation}</p>
    `;

    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });
});