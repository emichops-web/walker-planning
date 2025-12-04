const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("loadingSpinner");
const ctaContainer = document.getElementById("ctaContainer");
const submitBtn = document.querySelector(".submit-btn");

const WORKER_URL = "https://walker-planning-worker.emichops.workers.dev/";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show results card immediately
  resultCard.classList.remove("hidden");
  resultContent.innerHTML = "Analysing…";

  // Show spinner & disable button
  spinner.classList.remove("hidden");
  submitBtn.disabled = true;
  submitBtn.innerText = "Checking...";

  const payload = {
    postcode: document.getElementById("postcode").value.trim(),
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    projection: document.getElementById("projection").value,
    height: document.getElementById("height").value,
    boundary: document.getElementById("boundary").value,
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
    } else {
      // Colour-coded verdict box injected
      resultContent.innerHTML = `
        ${data.verdict_html}
        ${data.summary_html}
        ${data.issues_html}
        ${data.notes_html}
      `;

      // Reveal CTA
      ctaContainer.classList.remove("hidden");

      // Smooth scroll
      resultCard.scrollIntoView({ behavior: "smooth" });
    }

  } catch (err) {
    resultContent.innerHTML = `<p style="color:red;">Unexpected error: ${err.message}</p>`;
  }

  // Reset UI
  spinner.classList.add("hidden");
  submitBtn.disabled = false;
  submitBtn.innerText = "Run Feasibility Check";
});
