const steps = Array.from(document.querySelectorAll('.step'));
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const nextButton = document.getElementById('next-step');
const prevButton = document.getElementById('prev-step');
const progressBar = document.getElementById('progress-bar');
const progressValue = document.getElementById('progress-value');
const exportButton = document.getElementById('export-json');
const downloadButton = document.getElementById('download-json');
const exportOutput = document.getElementById('export-output');
const phaseSelect = document.getElementById('project-phase');
const resetButton = document.getElementById('reset-data');
const resetModal = document.getElementById('reset-modal');
const cancelResetButton = document.getElementById('cancel-reset');
const confirmResetButton = document.getElementById('confirm-reset');
const projectName = document.getElementById('project-name');
const menuToggle = document.getElementById('menu-toggle');
const drawerOverlay = document.getElementById('drawer-overlay');
const stepOrder = steps
  .map((step) => Number(step.dataset.step))
  .filter((value) => !Number.isNaN(value))
  .sort((a, b) => a - b);
const stepMap = new Map(steps.map((step) => [Number(step.dataset.step), step]));
const navMap = new Map(navItems.map((item) => [Number(item.dataset.step), item]));
const projectForgeFieldsContainer = document.getElementById('project-forge-fields');
const projectForgeTextareasContainer = document.getElementById('project-forge-textareas');
const mercyFieldsContainer = document.getElementById('mercy-fields');

const STORAGE_KEY = 'crucibleWriterData';

const movements = [
  { name: 'Ignition', range: '1-6', beats: [1, 2, 3, 4, 5, 6] },
  { name: 'First Tempering', range: '7-11', beats: [7, 8, 9, 10, 11] },
  { name: 'Scattering', range: '12-18', beats: [12, 13, 14, 15, 16, 17, 18] },
  { name: 'Brightest Burning', range: '19-27', beats: [19, 20, 21, 22, 23, 24, 25, 26, 27] },
  { name: 'Final Forging', range: '28-33', beats: [28, 29, 30, 31, 32, 33] },
  { name: 'Tempered Blade', range: '34-36', beats: [34, 35, 36] },
];

const defaultData = {
  meta: {
    author: '',
    title: '',
    genre: '',
    targetWordCount: 0,
  },
  mercy: {
    early: '',
    brewing: '',
    paidOff: '',
  },
};

const state = {
  currentStep: 0,
  data: structuredClone(defaultData),
};

const projectForgeFields = [
  {
    id: 'author',
    label: 'Author',
    placeholder: 'e.g., S. B. Smith',
    path: 'meta.author',
    kind: 'text',
    required: true,
  },
  {
    id: 'title',
    label: 'Project Title',
    placeholder: 'e.g., The Ashes of Elarion',
    path: 'meta.title',
    kind: 'text',
    required: true,
  },
  {
    id: 'genre',
    label: 'Genre',
    placeholder: 'Select a genre',
    path: 'meta.genre',
    kind: 'select',
    options: [
      'Epic Fantasy',
      'Urban Fantasy',
      'Dark Fantasy',
      'Cozy Fantasy',
      'Sword & Sorcery',
      'Romantic Fantasy',
      'YA Fantasy',
      'Progression Fantasy',
      'LitRPG',
      'Other',
    ],
    required: true,
  },
  {
    id: 'targetWordCount',
    label: 'Target Word Count',
    placeholder: 'e.g., 90000',
    path: 'meta.targetWordCount',
    kind: 'number',
    required: true,
  },
];

const projectForgeTextareas = [
  {
    id: 'premise',
    label: 'Story Premise',
    placeholder: 'Example: A cursed heir must restore a dying skyforge before the realm freezes.',
    path: 'premise',
    required: true,
    rows: 4,
  },
  {
    id: 'theme',
    label: 'Central Theme',
    placeholder: 'Example: Power without compassion corrodes everything it touches.',
    path: 'theme',
    required: true,
    rows: 3,
  },
];

const mercyFields = [
  {
    id: 'mercyEarly',
    label: 'Mercy (Early)',
    placeholder: 'Who receives mercy early?',
    path: 'mercy.early',
    required: true,
    kind: 'text',
  },
  {
    id: 'mercyBrewing',
    label: 'Mercy Brewing',
    placeholder: 'How does it echo?',
    path: 'mercy.brewing',
    kind: 'text',
  },
  {
    id: 'mercyPaid',
    label: 'Mercy Paid Off',
    placeholder: 'When does it return?',
    path: 'mercy.paidOff',
    kind: 'text',
  },
];

const beatsGrid = document.getElementById('beats-grid');

const renderField = (field) => {
  const label = document.createElement('label');
  label.classList.add('field');
  label.textContent = field.label;

  let control;
  if (field.kind === 'select') {
    control = document.createElement('select');
    const promptOption = document.createElement('option');
    promptOption.value = '';
    promptOption.textContent = field.placeholder;
    promptOption.disabled = true;
    promptOption.selected = true;
    control.appendChild(promptOption);
    field.options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      control.appendChild(optionElement);
    });
  } else {
    control = document.createElement('input');
    if (field.kind === 'number') {
      control.type = 'number';
    } else {
      control.type = 'text';
    }
    control.placeholder = field.placeholder ?? '';
  }

  control.name = field.id;
  control.dataset.path = field.path;
  if (field.required) {
    control.dataset.required = 'true';
  }
  label.appendChild(control);
  return label;
};

const renderTextarea = (field) => {
  const label = document.createElement('label');
  label.classList.add('field');
  label.textContent = field.label;
  const textarea = document.createElement('textarea');
  textarea.name = field.id;
  textarea.dataset.path = field.path;
  textarea.rows = field.rows ?? 3;
  textarea.placeholder = field.placeholder ?? '';
  if (field.required) {
    textarea.dataset.required = 'true';
  }
  label.appendChild(textarea);
  return label;
};

const renderProjectForgeFields = () => {
  if (!projectForgeFieldsContainer || !projectForgeTextareasContainer) {
    return;
  }
  projectForgeFieldsContainer.innerHTML = '';
  projectForgeTextareasContainer.innerHTML = '';
  projectForgeFields.forEach((field) => {
    projectForgeFieldsContainer.appendChild(renderField(field));
  });
  projectForgeTextareas.forEach((field) => {
    projectForgeTextareasContainer.appendChild(renderTextarea(field));
  });
};

const renderMercyFields = () => {
  if (!mercyFieldsContainer) {
    return;
  }
  mercyFieldsContainer.innerHTML = '';
  mercyFields.forEach((field) => {
    mercyFieldsContainer.appendChild(renderField(field));
  });
};

const buildBeatCards = () => {
  beatsGrid.innerHTML = '';
  movements.forEach((movement) => {
    movement.beats.forEach((beat) => {
      const card = document.createElement('div');
      card.className = 'beat-card';
      card.dataset.movement = movement.name;
      card.innerHTML = `
        <h4>Beat ${beat} <small>${movement.name}</small></h4>
        <label>Quest Strand
          <textarea name="beat${beat}Quest" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Example: Quest beat ${beat}..."></textarea>
        </label>
        <label>Fire Strand
          <textarea name="beat${beat}Fire" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Example: Fire beat ${beat}..."></textarea>
        </label>
        <label>Constellation Strand
          <textarea name="beat${beat}Constellation" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Example: Constellation beat ${beat}..."></textarea>
        </label>
      `;
      beatsGrid.appendChild(card);
    });
  });
};

const getValueByPath = (data, path) => {
  if (!path) {
    return undefined;
  }
  return path.split('.').reduce((accumulator, key) => {
    if (!accumulator || typeof accumulator !== 'object') {
      return undefined;
    }
    return accumulator[key];
  }, data);
};

const setValueByPath = (data, path, value) => {
  if (!path) {
    return;
  }
  const keys = path.split('.');
  let cursor = data;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    if (!cursor[key] || typeof cursor[key] !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key];
  });
};

const legacyPathMap = {
  'mercy.early': ['mercyPlanted'],
};

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }
  const parsed = JSON.parse(saved);
  state.data = structuredClone(defaultData);
  if (parsed.data) {
    state.data = { ...state.data, ...parsed.data };
    if (parsed.data.meta) {
      state.data.meta = { ...state.data.meta, ...parsed.data.meta };
    }
    if (parsed.data.mercy) {
      state.data.mercy = { ...state.data.mercy, ...parsed.data.mercy };
    }
  }
  state.currentStep = parsed.currentStep ?? 0;
  if (!stepMap.has(state.currentStep)) {
    state.currentStep = stepOrder[0] ?? 0;
  }
  document.querySelectorAll('[data-path]').forEach((input) => {
    const pathValue = getValueByPath(state.data, input.dataset.path);
    if (typeof pathValue !== 'undefined') {
      input.value = pathValue;
      return;
    }
    const legacyValue = state.data[input.name];
    if (typeof legacyValue !== 'undefined') {
      input.value = legacyValue;
      setValueByPath(state.data, input.dataset.path, legacyValue);
      return;
    }
    const legacyKeys = legacyPathMap[input.dataset.path] || [];
    const fallbackKey = legacyKeys.find((key) => typeof state.data[key] !== 'undefined');
    if (fallbackKey) {
      const fallbackValue = state.data[fallbackKey];
      input.value = fallbackValue;
      setValueByPath(state.data, input.dataset.path, fallbackValue);
    }
  });
  Object.entries(state.data).forEach(([key, value]) => {
    const input = document.querySelector(`[name="${key}"]`);
    if (!input) {
      return;
    }
    if (input.dataset.path) {
      return;
    }
    if (input.type === 'checkbox') {
      input.checked = Boolean(value);
    } else {
      input.value = value;
    }
  });
  if (parsed.projectPhase) {
    phaseSelect.value = parsed.projectPhase;
  }
  updateProjectName();
};

const saveState = () => {
  const payload = {
    currentStep: state.currentStep,
    data: state.data,
    projectPhase: phaseSelect.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const updateProgress = () => {
  const requiredInputs = document.querySelectorAll('[data-required="true"]');
  const total = requiredInputs.length;
  const filled = Array.from(requiredInputs).filter((input) => input.value.trim().length > 0).length;
  const percent = total === 0 ? 0 : Math.round((filled / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressValue.textContent = `${percent}%`;
};

const validateStep = (stepId) => {
  const step = stepMap.get(stepId);
  if (!step) {
    return false;
  }
  const required = Array.from(step.querySelectorAll('[data-required="true"]'));
  return required.every((input) => input.value.trim().length > 0);
};

const showStep = (stepId) => {
  if (!stepMap.has(stepId)) {
    return;
  }
  state.currentStep = stepId;
  steps.forEach((step) => step.classList.remove('active'));
  navItems.forEach((item) => item.classList.remove('active'));
  stepMap.get(stepId).classList.add('active');
  navMap.get(stepId)?.classList.add('active');
  const currentIndex = stepOrder.indexOf(stepId);
  prevButton.disabled = currentIndex <= 0;
  nextButton.textContent = currentIndex === stepOrder.length - 1 ? 'Finish' : 'Next Step';
  updateProgress();
  saveState();
};

const updateData = (event) => {
  const { name, type } = event.target;
  if (!name) {
    return;
  }
  const path = event.target.dataset.path;
  if (type === 'checkbox') {
    if (path) {
      setValueByPath(state.data, path, event.target.checked);
    } else {
      state.data[name] = event.target.checked;
    }
  } else if (path) {
    setValueByPath(state.data, path, event.target.value);
  } else {
    state.data[name] = event.target.value;
  }
  saveState();
  updateProgress();
  updateProjectName();
};

const updateProjectName = () => {
  if (!projectName) {
    return;
  }
  const title = getValueByPath(state.data, 'meta.title') || 'Untitled Project';
  projectName.textContent = title;
};

const filterBeats = (movementName) => {
  const cards = Array.from(document.querySelectorAll('.beat-card'));
  cards.forEach((card) => {
    card.style.display = card.dataset.movement === movementName ? 'block' : 'none';
  });
};

const initMovementSelector = () => {
  const pills = Array.from(document.querySelectorAll('.pill'));
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((button) => button.classList.remove('active'));
      pill.classList.add('active');
      filterBeats(pill.dataset.movement);
    });
  });
  filterBeats('Ignition');
};

const fillAiPrompt = (template) => {
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    const value = key.includes('.') ? getValueByPath(state.data, key) : state.data[key];
    if (typeof value === 'boolean') {
      return value ? 'complete' : 'pending';
    }
    return value ? value : '[add detail]';
  });
};

const wireAiButtons = () => {
  document.querySelectorAll('[data-ai="generate"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const container = event.target.closest('.step');
      const aiSection = container.querySelector('.ai-section');
      const output = container.querySelector('[data-ai-output]');
      const template = aiSection.dataset.prompt;
      const prompt = fillAiPrompt(template);
      output.textContent = prompt;
    });
  });
};

const generateExport = () => {
  const data = {
    ...state.data,
    projectPhase: phaseSelect.value,
    exportedAt: new Date().toISOString(),
  };
  exportOutput.value = JSON.stringify(data, null, 2);
};

const downloadExport = () => {
  if (!exportOutput.value) {
    generateExport();
  }
  const blob = new Blob([exportOutput.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const projectTitle = getValueByPath(state.data, 'meta.title');
  link.download = `${projectTitle || state.data.title || 'crucible-project'}-backup.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const openResetModal = () => {
  if (!resetModal) {
    return;
  }
  resetModal.classList.add('show');
  resetModal.setAttribute('aria-hidden', 'false');
};

const closeResetModal = () => {
  if (!resetModal) {
    return;
  }
  resetModal.classList.remove('show');
  resetModal.setAttribute('aria-hidden', 'true');
};

const resetLocalData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

const bindNavigation = () => {
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      showStep(Number(item.dataset.step));
    });
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep(state.currentStep)) {
      nextButton.classList.add('shake');
      setTimeout(() => nextButton.classList.remove('shake'), 300);
      return;
    }
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      showStep(stepOrder[currentIndex + 1]);
    }
  });

  prevButton.addEventListener('click', () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      showStep(stepOrder[currentIndex - 1]);
    }
  });
};

const bindInputs = () => {
  document.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', updateData);
  });
};

const openDrawer = () => {
  document.body.classList.add('sidebar-open');
};

const closeDrawer = () => {
  document.body.classList.remove('sidebar-open');
};

const bindDrawer = () => {
  menuToggle?.addEventListener('click', openDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);
  navItems.forEach((item) => {
    item.addEventListener('click', closeDrawer);
  });
};

renderProjectForgeFields();
renderMercyFields();
buildBeatCards();
loadState();
initMovementSelector();
wireAiButtons();
bindNavigation();
bindInputs();
bindDrawer();
showStep(state.currentStep);

exportButton.addEventListener('click', generateExport);
downloadButton.addEventListener('click', downloadExport);
phaseSelect.addEventListener('change', saveState);
resetButton?.addEventListener('click', openResetModal);
cancelResetButton?.addEventListener('click', closeResetModal);
confirmResetButton?.addEventListener('click', resetLocalData);
resetModal?.addEventListener('click', (event) => {
  if (event.target === resetModal) {
    closeResetModal();
  }
});
