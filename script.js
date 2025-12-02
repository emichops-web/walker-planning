// Listen for Tally submission events
window.addEventListener("message", async (event) => {
  if (!event.data?.includes("Tally.FormSubmission")) return;

  const parsed = JSON.parse(event.data);
  const answers = parsed.answers;

  // Map the Tally fields into simple variables
  const fields = {
    address: answers["What is the address?"] || "",
    propertyType: answers["Property Type"] || "",
    extensionType: answers["Extension type"] || "",
    depth: answers["Depth (metres)"] || "",
    height: answers["Height (metres)"] || "",
    constraints: answers["Constraints"] || ""
  };

  // Show result box
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("result").innerHTML = "Processing…";

  // Send data to Netlify AI function
  const response = await fetch("/.netlify/functions/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });

  const data = await response.json();
  document.getElementById("result").innerHTML = data.result;
});
