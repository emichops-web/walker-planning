// -----------------------------
// Dynamic dimension rendering
// -----------------------------
const projectType = document.getElementById("projectType");
const dimensionFields = document.getElementById("dimension-fields");

projectType.addEventListener("change", () => {
    const type = projectType.value;
    let html = "";

    const needsDims = [
        "rear-extension",
        "side-extension",
        "wrap-extension",
        "two-storey",
        "front-porch"
    ];

    if (needsDims.includes(type)) {
    html = `
        <label>Projection (m)</label>
        <input id="projection" type="number" step="0.1" />

        <label>Height (m)</label>
        <input id="height" type="number" step="0.1" />

        <label>Nearest boundary distance (m)</label>
        <input id="boundary" type="number" step="0.1" />
    `;
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

    if (document.getElementById("projection")) {
    payload.dimensions = {
        projection: parseFloat(document.getElementById("projection").value) || 0,
        height: parseFloat(document.getElementById("height").value) || 0,
        boundary: parseFloat(document.getElementById("boundary").value) || 0
    };
}

    const res = await fetch("https://walker-planning-worker.emichops.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    const box = document.getElementById("result-card");
    const content = document.getElementById("result-content");

    let verdictClass = 
        data.score >= 65 ? "verdict-good" :
        data.score >= 40 ? "verdict-warning" : "verdict-bad";

    content.innerHTML = `
        <div class="verdict-pill ${verdictClass}">${data.verdict}</div>

        <p><strong>Estimated likelihood:</strong> ${data.score}%</p>

        <h3>Summary</h3>
        <p>${data.assessment}</p>

        <h3>Positive Factors</h3>
        <ul>${data.positives.map(x => `<li>${x}</li>`).join("")}</ul>

        <h3>Key Risks</h3>
        <ul>${data.risks.map(x => `<li>${x}</li>`).join("")}</ul>

        <h3>Professional Assessment</h3>
        <p>${data.professional}</p>

        <h3>Recommendation</h3>
        <p>${data.recommendation}</p>

        <h3>Location</h3>
        <p><strong>Town:</strong> ${data.town || "Unknown"}</p>
        <p><strong>Authority:</strong> ${data.authority}</p>
        <p><strong>Nation:</strong> ${data.nation}</p>
    `;

    box.classList.remove("hidden");
    box.scrollIntoView({behavior:"smooth"});
});
