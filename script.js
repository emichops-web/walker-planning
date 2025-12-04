const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show card + loader
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = `<div class="loader"></div>`;

  // Collect form data
  const data = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    projection: document.getElementById("dimensionA").value,
    height: document.getElementById("dimensionB").value,
    boundaryDistance: document.getElementById("boundaryDistance").value,
    constraints: document.getElementById("constraints").value
  };

  try {
    const response = await fetch(
      "https://walker-planning-worker.emichops.workers.dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }
    );

    const json = await response.json();

    if (json.error) {
      resultContent.innerHTML =
        `<p style="color:red;"><strong>Server error:</strong> ${json.error}</p>`;
      return;
    }

    // Insert AI content
    resultContent.innerHTML = `
      ${json.conclusion_html}
      ${json.summary_html}
      ${json.details_html}
    `;

  } catch (err) {
    resultContent.innerHTML =
      `<p style="color:red;">Unexpected error: ${err.message}</p>`;
  }
});
