window.addEventListener("message", async (event) => {
  if (!event.data?.includes("Tally.FormSubmission")) return;

  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("result").textContent = "Processing…";

  const response = await fetch("/.netlify/functions/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submission: true })
  });

  const data = await response.json();
  document.getElementById("result").innerHTML = data.result;
});