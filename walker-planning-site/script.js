const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");

// Your Worker URL
const WORKER_URL = "https://walker-planning-worker.emichops.workers.dev/";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultCard.classList.remove("hidden");
  resultContent.innerHTML = "Analysing…";

  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value,
    extensionType: document.getElementById("extensionType").value,
    depth: document.getElementById("depth").value,
    height: document.getElementById("height").value,
    constraints: document.getElementById("constraints").value
  };

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      resultContent.innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    // Render structured AI result
    resultContent.innerHTML = `
      ${data.conclusion_html}
      ${data.summary_html}
      ${data.details_html}
    `;

  } catch (err) {
    resultContent.innerHTML = `<p style="color:red;">Unexpected error: ${err.message}</p>`;
  }
});
