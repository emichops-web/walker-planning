// ======================
// DIMENSION RULES
// ======================
const dimensionRules = {
    "Rear extension": ["Projection (m)", "Height (m)", "Distance to boundary (m)"],
    "Side extension": ["Projection (m)", "Height (m)", "Distance to boundary (m)"],
    "Wrap-around extension": ["Rear projection (m)", "Side projection (m)", "Height (m)"],
    "Porch / front extension": ["Projection (m)", "Height (m)", "Width (m)"],
    "Loft conversion": [],
    "Dormer extension": ["Projection (m)", "Height (m)"],
    "Garage conversion": [],
    "Two-storey extension": ["Projection (m)", "Height (m)", "Distance to boundary (m)"],
    "Garden room / outbuilding": ["Footprint (m²)", "Height (m)"],
    "Annexe / outbuilding": ["Footprint (m²)", "Height (m)"]
};

// ======================
// RENDER DIMENSION INPUTS
// ======================
function renderDimensionFields(projectType) {
    const container = document.getElementById("dimensionFields");
    if (!container) return; // fail safe

    container.innerHTML = "";

    const fields = dimensionRules[projectType] || [];
    if (fields.length === 0) return; // nothing to render

    fields.forEach(label => {
        const wrapper = document.createElement("div");
        wrapper.className = "dimension-field";

        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.1";
        input.min = "0";
        input.placeholder = label;

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    });
}

// ======================
// EVENT LISTENER
// ======================
document.getElementById("projectType")?.addEventListener("change", (e) => {
    renderDimensionFields(e.target.value);
});

// ======================
// RUN CHECK HANDLER
// ======================
document.getElementById("runCheckBtn")?.addEventListener("click", async () => {
    const postcode = document.getElementById("postcode").value.trim();
    const propertyType = document.getElementById("propertyType").value.trim();
    const projectType = document.getElementById("projectType").value.trim();
    const areaStatus = document.getElementById("areaStatus").value.trim();
    const propertyStatus = document.getElementById("propertyStatus").value.trim();
    const description = document.getElementById("description").value.trim();
    
    const dims = {};
    document.querySelectorAll("#dimensionFields input").forEach((input, i) => {
        dims[`dim${i+1}`] = input.value.trim();
    });

    const payload = {
        postcode,
        propertyType,
        projectType,
        areaStatus,
        propertyStatus,
        description,
        dimensions: dims
    };

    const resultsBox = document.getElementById("resultsBox");
    resultsBox.innerHTML = "<div class='loader'>● ● ●</div>";

    try {
        const res = await fetch("https://walker-planning-worker.emichops.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        resultsBox.innerHTML = data.html || "<p>Unexpected response format.</p>";
    } catch (err) {
        resultsBox.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
});
