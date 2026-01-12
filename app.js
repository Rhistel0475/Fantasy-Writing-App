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
    author: "",
    title: "",
    genre: "",
    targetWordCount: 90000,

    mercyPlanted: "",
    mercyBrewing: "",
    mercyPaid: "",

    chapterCount: "",
    chapterWords: "",
    chapterNotes: "",
  };
}

function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const p = raw ? safeParse(raw, null) : null;
  return p && typeof p === "object" ? { ...getDefaultProject(), ...p } : getDefaultProject();
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
  // Very simple: count required fields filled + some important optional ones
  const requiredKeys = ["author", "title", "genre"];
  const optionalKeys = ["targetWordCount", "mercyPlanted", "mercyBrewing", "mercyPaid"];

  let filled = 0;
  let total = requiredKeys.length + optionalKeys.length;

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
}

function fillTemplate(template, project) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = project[key];
    return v === undefined || v === null ? "" : String(v);
  });
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

  // Populate all fields
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
    });
  });

  // Sidebar nav buttons
  qsa(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-step") || "0");
      showStep(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Next/Back buttons
  const prevBtn = qs("#prev-step");
  const nextBtn = qs("#next-step");

  function getActiveStepIndex() {
    const active = qs(".step.active");
    if (!active) return 0;
    return Number(active.getAttribute("data-step") || "0");
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const current = getActiveStepIndex();
      const next = Math.max(0, current - 1);
      showStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const current = getActiveStepIndex();
      const next = Math.min(8, current + 1);
      showStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      saveProject(project);
      updateProgressUI(project);

      const template = section.getAttribute("data-prompt") || "";
      const prompt = fillTemplate(template, project);

      // Find the output area after this section
      const output = section.parentElement.querySelector("[data-ai-output]");
      if (output) {
        output.textContent = prompt;
      }
    });
  });

  // Export JSON
  const exportBtn = qs("#export-json");
  const downloadBtn = qs("#download-json");
  const exportOut = qs("#export-output");

  function getProjectSnapshot() {
    // Ensure latest values
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

  if (downloadBtn && exportOut) {
    downloadBtn.addEventListener("click", () => {
      const snapshot = getProjectSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
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

  // Start at step 0
  showStep(0);
});