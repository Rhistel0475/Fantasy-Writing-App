const STORAGE_KEY = "crucible.project.v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function getDefaultProject() {
  return {
    projectPhase: "Planning",

    // Project Forge
    author: "",
    title: "",
    genre: "",
    targetWordCount: 90000,
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
 * - wordCount -> targetWordCount
 * - mercy.early -> mercyPlanted (if older nested structure exists)
 * - keep mercyPlanted as the canonical "early mercy" field
 */
function migrateProject(p) {
  const out = { ...p };

  // wordCount -> targetWordCount
  if (
    (out.targetWordCount === undefined || out.targetWordCount === null || out.targetWordCount === "") &&
    (out.wordCount !== undefined && out.wordCount !== null && String(out.wordCount).trim() !== "")
  ) {
    out.targetWordCount = out.wordCount;
  }

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
  const raw = localStorage.getItem(STORAGE_KEY);
  const p = raw ? safeParse(raw, null) : null;

  if (p && typeof p === "object") {
    const migrated = migrateProject(p);
    return { ...getDefaultProject(), ...migrated };
  }
  return getDefaultProject();
}

function saveProject(project) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
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

  if (stepEl) stepEl.classList.add("active");
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

function fillTemplate(template, project) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = project[key];
    return v === undefined || v === null ? "" : String(v);
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
    phaseSelect.value = project.projectPhase || "Planning";
    phaseSelect.addEventListener("change", () => {
      project.projectPhase = phaseSelect.value;
      saveProject(project);
    });
  }

  // Populate all fields from storage
  getAllFields().forEach((el) => {
    // Support legacy name="wordCount" if your HTML still uses it
    if (el.name === "wordCount" && project.targetWordCount !== undefined) {
      setFieldValue(el, project.targetWordCount);
      return;
    }
    setFieldValue(el, project[el.name]);
  });

  updateProgressUI(project);

  // Save on change
  getAllFields().forEach((el) => {
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      const key = el.name === "wordCount" ? "targetWordCount" : el.name;
      project[key] = getFieldValue(el);
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
  if (beginBtn) {
    beginBtn.addEventListener("click", (event) => {
      const href = beginBtn.getAttribute("href");
      if (href) {
        event.preventDefault();
        window.location.href = href;
        return;
      }
      showStep(0);
    });
  }

  // AI Guidance (display prompt)
  qsa('[data-ai="generate"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".ai-section, .ai-block");
      if (!section) return;

      // Refresh project from fields right before generating
      getAllFields().forEach((el) => {
        const key = el.name === "wordCount" ? "targetWordCount" : el.name;
        project[key] = getFieldValue(el);
      });
      if (phaseSelect) project.projectPhase = phaseSelect.value;

      saveProject(project);
      updateProgressUI(project);

      const template = section.getAttribute("data-prompt") || "";
      const prompt = fillTemplate(template, project);

      const output = section.querySelector("[data-ai-output]");
      if (output) output.textContent = prompt;
    });
  });

  // Export JSON
  const exportBtn = qs("#export-json");
  const downloadBtn = qs("#download-json");
  const exportOut = qs("#export-output");

  function getProjectSnapshot() {
    getAllFields().forEach((el) => {
      const key = el.name === "wordCount" ? "targetWordCount" : el.name;
      project[key] = getFieldValue(el);
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

  // Start at first existing step (usually 0)
  const order = getExistingStepOrder();
  showStep(order.length ? order[0] : 0);
});
