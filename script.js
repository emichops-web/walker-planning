/* --------------------------
   ENVIRONMENT TOGGLE
-------------------------- */
const USE_DEV = true;   // set false for production

const WORKER_URL = USE_DEV
  ? "https://walker-planning-worker-dev.emichops.workers.dev/"
  : "https://walker-planning-worker.emichops.workers.dev/";

/* --------------------------
   ELEMENTS
-------------------------- */
const postcodeEl = document.getElementById("postcode");
const propertyEl = document.getElementById("propertyType");
const projectEl  = document.getElementById("projectType");
const areaEl     = document.getElementById("areaStatus");
const listedEl   = document.getElementById("listed");

const projEl     = document.getElementById("projection");
const heightEl   = document.getElementById("height");
const boundaryEl = document.getElementById("boundary");
const dimFields  = document.getElementById("dimensionFields");

const errorBox   = document.getElementById("errorBox");
const resultBox  = document.getElementById("resultContainer");

const decisionPillEl = document.getElementById("decisionPill");
const summaryText    = document.getElementById("summaryText");
const professionalEl = document.getElementById("professionalAssessment");
const risksList      = document.getElementById("risksList");
const positiveList   = document.getElementById("positiveList");

/* --------------------------
   PROJECT → DIMENSION RULES
-------------------------- */
const needsDims = new Set([
  "rear-extension",
  "side-extension",
  "wrap-extension",
  "two-storey",
  "front-porch",
  "dormer",
  "garden-outbuilding",
  "annexe"
]);

projectEl.addEventListener("change", () => {
  dimFields.classList.toggle("hidden", !needsDims.has(projectEl.value));
  clearResults();
});

/* --------------------------
   VALIDATION
-------------------------- */
function validateForm() {
  if (!postcodeEl.value.trim()) return "Enter a valid postcode.";
  if (!propertyEl.value) return "Select a property type.";
  if (!projectEl.value) return "Select a project type.";

  if (listedEl.value === "yes") return null; // listed = always planning → worker handles

  if (needsDims.has(projectEl.value)) {
    if (!projEl.value) return "Enter projection (m).";
    if (!heightEl.value) return "Enter height (m).";
    if (!boundaryEl.value) return "Enter distance to boundary (m).";
  }

  return null;
}

/* --------------------------
   CLEAR RESULTS / ERRORS
-------------------------- */
function clearResults() {
  errorBox.classList.add("hidden");
  resultBox.classList.add("hidden");
}

/* --------------------------
   MAIN REQUEST
-------------------------- */
document.getElementById("checkBtn").addEventListener("click", async () => {
  clearResults();

  const err = validateForm();
  if (err) {
    errorBox.textContent = err;
    errorBox.classList.remove("hidden");
    return;
  }

  const payload = {
    postcode: postcodeEl.value.trim(),
    propertyType: propertyEl.value,
    projectType: projectEl.value,
    areaStatus: areaEl.value,
    listed: listedEl.value,
    dimensions: needsDims.has(projectEl.value)
      ? {
          projection: Number(projEl.value),
          height: Number(heightEl.value),
          boundary: Number(boundaryEl.value)
        }
      : {}
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.error) {
      errorBox.textContent = data.error;
      errorBox.classList.remove("hidden");
      return;
    }

    populateResults(data);

  } catch (e) {
    errorBox.textContent = "A network or server error occurred.";
    errorBox.classList.remove("hidden");
  }
});

/* --------------------------
   RENDER RESULTS
-------------------------- */
function populateResults(data) {
  const pillText = data.decision_label;
  const pillClass =
    data.decision === "green" ? "pill-green" :
    data.decision === "amber" ? "pill-amber" :
    "pill-red";

  decisionPillEl.innerHTML = `<span class="pill ${pillClass}">${pillText}</span>`;
  summaryText.textContent = data.summary;
  professionalEl.textContent = data.professionalAssessment;

  risksList.innerHTML = "";
  data.keyRisks.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    risksList.appendChild(li);
  });

  positiveList.innerHTML = "";
  data.positive.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    positiveList.appendChild(li);
  });

  resultBox.classList.remove("hidden");
}