document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("planningForm");
  const resultsBox = document.getElementById("results");
  const spinner = document.getElementById("loadingSpinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    resultsBox.innerHTML = "";
    spinner.style.display = "block";

    const payload = {
      postcode: document.getElementById("postcode").value.trim(),
      projectType: document.getElementById("projectType").value.trim(),
      propertyType: document.getElementById("propertyType").value.trim(),
      areaStatus: document.getElementById("areaStatus").value.trim(),
      propertyStatus: document.getElementById("propertyStatus").value.trim(),
      description: document.getElementById("description").value.trim(),
      dimensions: {
        projection: parseFloat(document.getElementById("projection")?.value || 0),
        height: parseFloat(document.getElementById("height")?.value || 0),
        boundary: parseFloat(document.getElementById("boundary")?.value || 0)
      }
    };

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      spinner.style.display = "none";

      if (data.error) {
        resultsBox.innerHTML = `<p class="error">${data.error}</p>`;
        return;
      }

      // 👍 Confidence bar width
      const barWidth = Math.max(5, Math.min(95, data.score));

      resultsBox.innerHTML = `
        <div class="fade-in">

          <div class="verdict-pill">${data.verdict}</div>

          <div class="confidence-block">
            <h3>Permitted Development Likelihood</h3>
            <p class="confidence-num">${data.score}% likelihood</p>

            <div class="confidence-bar">
              <div class="confidence-bar-fill" style="width:${barWidth}%;"></div>
            </div>
          </div>

          <h3>Potential Positive Factors</h3>
          <ul>${data.positives.map(p=>`<li>${p}</li>`).join("")}</ul>

          <h3>Key Risks</h3>
          <ul>${data.risks.map(r=>`<li>${r}</li>`).join("")}</ul>

          <h3>Professional Assessment</h3>
          <p>${data.assessmentText}</p>

          <h3>Recommendation</h3>
          <p>${data.recommendation}</p>

          <h3>Location Context</h3>
          <p><strong>Town:</strong> ${data.town}</p>
          <p><strong>Local Authority:</strong> ${data.authority}</p>
          <p><strong>Nation:</strong> ${data.nation}</p>

          <p class="note">This automated assessment provides an initial indication only. Walker Planning can provide a formal planning appraisal if required.</p>
        </div>
      `;

      resultsBox.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      spinner.style.display = "none";
      resultsBox.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
  });
});
