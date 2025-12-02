// Listen for messages coming from the Tally iframe
window.addEventListener("message", async function(event) {
    if (event.data?.event !== "tally:form-submitted") return;

    console.log("Tally form submitted!", event.data);

    // Show result section
    const resultSection = document.getElementById("result-section");
    const resultBox = document.getElementById("result");
    resultSection.classList.remove("hidden");
    resultBox.innerText = "Processing…";

    // Extract the answers from Tally payload
    const answers = event.data.payload?.answers || {};

    try {
        const response = await fetch("/.netlify/functions/analyse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(answers)
        });

        const data = await response.json();
        resultBox.innerHTML = data.result || "No analysis returned.";
    } 
    catch (error) {
        console.error("Error:", error);
        resultBox.innerText = "Error generating analysis.";
    }
});
