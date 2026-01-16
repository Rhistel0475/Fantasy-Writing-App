const STORAGE_KEY = "crucible.project.v1";

// Default values
const DEFAULT_TARGET_WORD_COUNT = 90000;
const DEFAULT_PROJECT_PHASE = "Planning";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function getDefaultProject() {
  return {
    projectPhase: DEFAULT_PROJECT_PHASE,

    // Project Forge
    author: "",
    title: "",
    genre: "",
    targetWordCount: DEFAULT_TARGET_WORD_COUNT,
    premise: "",
    theme: "",

    // Story Strands
    questSummary: "",
    questGoal: "",
    questKeyBeats: "",
    fireSummary: "",
    fireWound: "",
    fireKeyBeats: "",
    constellationSummary: "",
    constellationAllies: "",
    constellationKeyBeats: "",

    // 36-Beat Map
    ignitionSummary: "",
    ignitionBeats: "",
    firstTemperingSummary: "",
    firstTemperingBeats: "",
    scatteringSummary: "",
    scatteringBeats: "",
    brightestBurningSummary: "",
    brightestBurningBeats: "",
    finalForgingSummary: "",
    finalForgingBeats: "",
    temperedBladeSummary: "",
    temperedBladeBeats: "",

    // Forge Points
    forgeIgnitionStakes: "",
    forgeIgnitionConvergence: "",
    forgeFirstCrucibleStakes: "",
    forgeFirstCrucibleConvergence: "",
    forgeSecondCrucibleStakes: "",
    forgeSecondCrucibleConvergence: "",
    forgeThirdCrucibleStakes: "",
    forgeThirdCrucibleConvergence: "",
    forgeApexStakes: "",
    forgeApexConvergence: "",

    // Planning Docs
    crucibleThesis: "",
    darkMirrorProfile: "",
    constellationBible: "",
    worldForge: "",
    mercyLedger: "",
    strandMapNotes: "",

    // Characters
    protagonistName: "",
    protagonistArc: "",
    antagonistName: "",
    antagonistTraits: "",
    constellationCast: "",
    relationshipShifts: "",
    characterRoster: "",
    characterNotes: "",

    // Mercy Engine
    mercyPlanted: "",
    mercyBrewing: "",
    mercyPaid: "",
    mercyNotes: "",

    // Chapters
    chapterCount: "",
    chapterWords: "",
    chapterNotes: "",
  };
}

/**
 * Legacy migrations:
 * - mercy.early -> mercyPlanted (if older nested structure exists)
 * - keep mercyPlanted as the canonical "early mercy" field
 */
function migrateProject(p) {
  const out = { ...p };

  // mercy.early -> mercyPlanted
  if (
    (out.mercyPlanted === undefined || out.mercyPlanted === null || String(out.mercyPlanted).trim() === "") &&
    out.mercy &&
    typeof out.mercy === "object" &&
    out.mercy.early
  ) {
    out.mercyPlanted = out.mercy.early;
  }

  return out;
}

function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw ? safeParse(raw, null) : null;

    if (p && typeof p === "object") {
      const migrated = migrateProject(p);
      return { ...getDefaultProject(), ...migrated };
    }
    return getDefaultProject();
  } catch (err) {
    console.error("Failed to load project from localStorage:", err);
    showStorageError("Unable to load saved project. Your browser's storage may be disabled.");
    return getDefaultProject();
  }
}

function saveProject(project) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.error("Failed to save project to localStorage:", err);
    if (err.name === "QuotaExceededError") {
      showStorageError("Storage quota exceeded! Your changes may not be saved. Try exporting your project as a backup.");
    } else {
      showStorageError("Unable to save changes. Your browser's storage may be disabled or full.");
    }
  }
}

function showStorageError(message) {
  const alert = qs("#step-alert");
  if (alert) {
    alert.textContent = message;
    alert.classList.add("visible");
    alert.style.backgroundColor = "#dc2626";
    alert.style.color = "#fff";
  } else {
    // Fallback if alert element doesn't exist
    alert(message);
  }
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function getAllFields() {
  return qsa("input[name], textarea[name], select[name]");
}

function setFieldValue(el, value) {
  if (el.tagName === "SELECT") {
    el.value = value ?? "";
    return;
  }
  if (el.type === "number") {
    el.value = value === undefined || value === null ? "" : String(value);
    return;
  }
  el.value = value ?? "";
}

function getFieldValue(el) {
  if (el.tagName === "SELECT") return el.value;
  if (el.type === "number") return el.value; // keep as string for now
  return el.value;
}

function computeCompletion(project) {
  const requiredKeys = [
    "author",
    "title",
    "genre",
    "questSummary",
    "fireSummary",
    "constellationSummary",
    "ignitionSummary",
    "firstTemperingSummary",
    "scatteringSummary",
    "brightestBurningSummary",
    "finalForgingSummary",
    "temperedBladeSummary",
    "forgeIgnitionStakes",
    "forgeFirstCrucibleStakes",
    "forgeSecondCrucibleStakes",
    "forgeThirdCrucibleStakes",
    "forgeApexStakes",
    "crucibleThesis",
    "constellationBible",
    "protagonistName",
    "antagonistName",
    "constellationCast",
  ];
  const optionalKeys = [
    "targetWordCount",
    "premise",
    "theme",
    "questGoal",
    "questKeyBeats",
    "fireWound",
    "fireKeyBeats",
    "constellationAllies",
    "constellationKeyBeats",
    "mercyPlanted",
    "mercyBrewing",
    "mercyPaid",
    "chapterCount",
  ];

  let filled = 0;
  const total = requiredKeys.length + optionalKeys.length;

  for (const k of requiredKeys) {
    if ((project[k] ?? "").toString().trim().length > 0) filled++;
  }
  for (const k of optionalKeys) {
    const v = project[k];
    if (v === 0) filled++;
    else if ((v ?? "").toString().trim().length > 0) filled++;
  }

  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  return Math.max(0, Math.min(100, pct));
}

function updateProgressUI(project) {
  const pct = computeCompletion(project);
  const bar = qs("#progress-bar");
  const val = qs("#progress-value");
  if (bar) bar.style.width = pct + "%";
  if (val) val.textContent = pct + "%";
}

function showStep(stepIndex) {
  const steps = qsa(".step");
  const nav = qsa(".nav-item");

  steps.forEach((s) => s.classList.remove("active"));
  nav.forEach((n) => n.classList.remove("active"));

  const stepEl = qs(`.step[data-step="${stepIndex}"]`);
  const navEl = qs(`.nav-item[data-step="${stepIndex}"]`);

  if (stepEl) {
    stepEl.classList.add("active");
    // Focus management for accessibility
    const heading = stepEl.querySelector("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }
  if (navEl) navEl.classList.add("active");

  const alert = qs("#step-alert");
  if (alert) {
    alert.textContent = "";
    alert.classList.remove("visible");
  }
}

/**
 * Returns an ordered array of step indexes that actually exist in the DOM.
 * This fixes “blank page” when steps 1–5 aren’t in index.html yet.
 */
function getExistingStepOrder() {
  return qsa(".step")
    .map((el) => Number(el.getAttribute("data-step")))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

function sanitizeText(text) {
  // Basic HTML entity encoding to prevent XSS
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function fillTemplate(template, project) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = project[key];
    if (v === undefined || v === null) return "";
    // Sanitize the value to prevent any XSS attempts
    return sanitizeText(String(v));
  });
}

function validateStep(stepIndex) {
  const stepEl = qs(`.step[data-step="${stepIndex}"]`);
  if (!stepEl) return true;

  const required = qsa('[data-required="true"]', stepEl);
  let firstInvalid = null;

  required.forEach((el) => {
    const value = getFieldValue(el).toString().trim();
    const isValid = value.length > 0;
    el.classList.toggle("is-invalid", !isValid);
    if (!isValid && !firstInvalid) firstInvalid = el;
  });

  const alert = qs("#step-alert");
  if (alert) {
    if (firstInvalid) {
      alert.textContent = "Complete the required fields before moving to the next step.";
      alert.classList.add("visible");
    } else {
      alert.textContent = "";
      alert.classList.remove("visible");
    }
  }

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: true });
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  let project = loadProject();

  // Phase selector
  const phaseSelect = qs("#project-phase");
  if (phaseSelect) {
    phaseSelect.value = project.projectPhase || DEFAULT_PROJECT_PHASE;
    phaseSelect.addEventListener("change", () => {
      project.projectPhase = phaseSelect.value;
      saveProject(project);
    });
  }

  // Populate all fields from storage
  getAllFields().forEach((el) => {
    setFieldValue(el, project[el.name]);
  });

  updateProgressUI(project);

  // Save on change
  getAllFields().forEach((el) => {
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      project[el.name] = getFieldValue(el);
      saveProject(project);
      updateProgressUI(project);
      el.classList.remove("is-invalid");
    });
  });

  // Sidebar nav buttons
  qsa(".nav-item").forEach((btn) => {
    if (btn.tagName === "A" && btn.getAttribute("href")) {
      return;
    }

    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-step") || "0");
      const order = getExistingStepOrder();
      const current = getActiveStepIndex();
      const currentPos = order.indexOf(current);
      const nextStep = order[currentPos + 1];

      if (idx > current) {
        if (idx !== nextStep || !validateStep(current)) return;
      }

      showStep(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Next/Back buttons (only moves through steps that exist)
  const prevBtn = qs("#prev-step");
  const nextBtn = qs("#next-step");

  function getActiveStepIndex() {
    const active = qs(".step.active");
    if (!active) return 0;
    return Number(active.getAttribute("data-step") || "0");
  }

  function goRelative(delta) {
    const order = getExistingStepOrder();
    if (order.length === 0) return;

    const current = getActiveStepIndex();
    const pos = Math.max(0, order.indexOf(current));
    const nextPos = Math.max(0, Math.min(order.length - 1, pos + delta));
    const nextStep = order[nextPos];

    if (delta > 0 && !validateStep(current)) return;

    showStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStepNav(btn, delta) {
    if (!btn) return;
    btn.addEventListener("click", (event) => {
      const href = btn.getAttribute("data-href");
      if (href) {
        if (delta > 0 && !validateStep(getActiveStepIndex())) {
          event.preventDefault();
          return;
        }
        window.location.href = href;
        return;
      }
      goRelative(delta);
    });
  }

  handleStepNav(prevBtn, -1);
  handleStepNav(nextBtn, 1);

  const beginBtn = qs("#begin-journey");
  if (beginBtn && !beginBtn.getAttribute("href")) {
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      showStep(0);
    });
  }

  const beginBtn = qs("#begin-journey");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      const appRoot = qs("#app-root");
      if (appRoot) appRoot.classList.add("show-wizard");
      showStep(0);
      const layout = qs(".layout");
      if (layout) {
        layout.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // AI Guidance (display prompt)
  qsa('[data-ai="generate"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".ai-section");
      if (!section) return;

      // Refresh project from fields right before generating
      getAllFields().forEach((el) => {
        project[el.name] = getFieldValue(el);
      });
      if (phaseSelect) project.projectPhase = phaseSelect.value;

      saveProject(project);
      updateProgressUI(project);

      const template = section.getAttribute("data-prompt") || "";
      const prompt = fillTemplate(template, project);

      const output = section.parentElement.querySelector("[data-ai-output]");
      if (output) output.textContent = prompt;
    });
  });

  // Export JSON
  const exportBtn = qs("#export-json");
  const downloadBtn = qs("#download-json");
  const exportOut = qs("#export-output");

  function getProjectSnapshot() {
    getAllFields().forEach((el) => {
      project[el.name] = getFieldValue(el);
    });
    if (phaseSelect) project.projectPhase = phaseSelect.value;
    saveProject(project);
    return project;
  }

  if (exportBtn && exportOut) {
    exportBtn.addEventListener("click", () => {
      const snapshot = getProjectSnapshot();
      exportOut.value = JSON.stringify(snapshot, null, 2);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const snapshot = getProjectSnapshot();
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${(snapshot.title || "crucible-project").replace(/[^\w\-]+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    });
  }

  // Import JSON
  const importBtn = qs("#import-json");
  const importFile = qs("#import-file");

  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => {
      importFile.click();
    });

    importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = safeParse(event.target.result, null);
          if (!imported || typeof imported !== "object") {
            alert("Invalid JSON file. Please select a valid project backup.");
            return;
          }

          // Confirm before overwriting
          const confirmMsg = imported.title
            ? `Import project "${imported.title}"? This will replace your current project.`
            : "Import this project? This will replace your current project.";

          if (!confirm(confirmMsg)) {
            importFile.value = ""; // Reset file input
            return;
          }

          // Merge with defaults and migrate
          const migrated = migrateProject(imported);
          project = { ...getDefaultProject(), ...migrated };

          // Update all fields in UI
          getAllFields().forEach((el) => {
            setFieldValue(el, project[el.name]);
          });

          if (phaseSelect) {
            phaseSelect.value = project.projectPhase || DEFAULT_PROJECT_PHASE;
          }

          // Save and update UI
          saveProject(project);
          updateProgressUI(project);

          // Clear export output and show success
          if (exportOut) exportOut.value = "";
          alert("Project imported successfully!");

          // Go to first step
          const order = getExistingStepOrder();
          showStep(order.length ? order[0] : 0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          console.error("Import failed:", err);
          alert("Failed to import project. Please check that the file is a valid JSON backup.");
        } finally {
          importFile.value = ""; // Reset file input
        }
      };

      reader.onerror = () => {
        alert("Failed to read file. Please try again.");
        importFile.value = "";
      };

      reader.readAsText(file);
    });
  }

  // Begin Journey button
  const beginBtn = qs("#begin-journey");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      const appRoot = qs("#app-root");
      if (appRoot) {
        appRoot.classList.remove("is-hero");
        appRoot.classList.add("show-wizard");
      }
      showStep(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Start at first existing step (usually 0)
  const order = getExistingStepOrder();
  showStep(order.length ? order[0] : 0);
});
