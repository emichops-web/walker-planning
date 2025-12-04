document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("planningForm");
  const resultCard = document.getElementById("resultCard");
  const resultContent = document.getElementById("resultContent");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- Collect FIELD VALUES ---
    const postcode = document.getElementById("postcode")?.value.trim();
    const propertyType = document.getElementById("propertyType")?.value.trim();
    const projectType = document.getElementById("projectType")?.value.trim();
    const projection = document.getElementById("projection")?.value.trim();
    const height = document.getElementById("height")?.value.trim();
    const boundary = document.getElementById("boundaryDistance")?.value.trim();
    const constraints = document.getElementById("constraints")?.value.trim();

    // --- Show Loading State ---
    resultCard.classList.remove("hidden");
    resultContent.innerHTML = `<p>Analysing…</p>`;

    // --- Build Request Payload ---
    const payload = {
      postcode,
      propertyType,
      projectType,
      projection,
      height,
      boundaryDistance: boundary,
      constraints
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch("https://walker-planning-worker.emichops.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.error) {
        resultContent.innerHTML = `
          <p style="color:#c00; font-weight:600;">${data.error}</p>
          <p class="disclaimer"><strong>Disclaimer:</strong> This tool provides an automated overview. Planning rules vary locally — consult your local authority or a planning professional before starting work.</p>
        `;
        return;
      }

      // --- Success: Insert AI Result HTML ---
      resultContent.innerHTML = `
        ${data.conclusion_html}
        ${data.summary_html}
        ${data.details_html}
        <p class="disclaimer"><strong>Disclaimer:</strong> This tool provides an automated overview. Planning rules vary locally — always consult your local planning authority or a qualified planning consultant.</p>
      `;

    } catch (err) {
      console.error("Fetch error:", err);
      resultContent.innerHTML = `
        <p style="color:#c00; font-weight:600;">Server error: ${err.message}</p>
        <p class="disclaimer"><strong>Disclaimer:</strong> This tool provides an automated overview. Planning rules vary locally — consult your local authority or a planning professional before starting work.</p>
      `;
    }
  });
});
