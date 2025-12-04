const form = document.getElementById("planningForm");
const resultCard = document.getElementById("resultCard");
const resultContent = document.getElementById("resultContent");
const spinner = document.getElementById("spinner");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultCard.classList.remove("hidden");
  spinner.classList.remove("hidden");
  resultContent.textContent = "Analysing…";

  const payload = {
    postcode: document.getElementById("postcode").value,
    propertyType: document.getElementById("propertyType").value,
    projectType: document.getElementById("projectType").value,
    projection: document.getElementById("projection").value,
    height: document.getElementById("height").value,
    boundaryDistance: document.getElementById("boundaryDistance").value,
    constraints: document.getElementById("constraints").value
  };

  try {
    const res = await fetch("https://walker-planning-worker.emichops.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      spinner.classList.add("hidden");
      resultContent.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    spinner.classList.add("hidden");
    resultContent.innerHTML = `
      ${data.conclusion_html}
      ${data.summary_html}
      ${data.details_html}
    `;

  } catch (err) {
    spinner.classList.add("hidden");
    resultContent.innerHTML = `<p style="color:red">Unexpected error: ${err.message}</p>`;
  }
});
