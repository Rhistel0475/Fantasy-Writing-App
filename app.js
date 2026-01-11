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

const STORAGE_KEY = 'crucibleWriterData';

const movements = [
  { name: 'Ignition', range: '1-6', beats: [1, 2, 3, 4, 5, 6] },
  { name: 'First Tempering', range: '7-11', beats: [7, 8, 9, 10, 11] },
  { name: 'Scattering', range: '12-18', beats: [12, 13, 14, 15, 16, 17, 18] },
  { name: 'Brightest Burning', range: '19-27', beats: [19, 20, 21, 22, 23, 24, 25, 26, 27] },
  { name: 'Final Forging', range: '28-33', beats: [28, 29, 30, 31, 32, 33] },
  { name: 'Tempered Blade', range: '34-36', beats: [34, 35, 36] },
];

const state = {
  currentStep: 0,
  data: {},
};

const beatsGrid = document.getElementById('beats-grid');

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
          <textarea name="beat${beat}Quest" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Quest beat ${beat}..."></textarea>
        </label>
        <label>Fire Strand
          <textarea name="beat${beat}Fire" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Fire beat ${beat}..."></textarea>
        </label>
        <label>Constellation Strand
          <textarea name="beat${beat}Constellation" rows="2" ${beat === 1 ? 'data-required="true"' : ''} placeholder="Constellation beat ${beat}..."></textarea>
        </label>
      `;
      beatsGrid.appendChild(card);
    });
  });
};

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }
  const parsed = JSON.parse(saved);
  state.data = parsed.data || {};
  state.currentStep = parsed.currentStep ?? 0;
  Object.entries(state.data).forEach(([key, value]) => {
    const input = document.querySelector(`[name="${key}"]`);
    if (!input) {
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

const validateStep = (index) => {
  const step = steps[index];
  const required = Array.from(step.querySelectorAll('[data-required="true"]'));
  return required.every((input) => input.value.trim().length > 0);
};

const showStep = (index) => {
  state.currentStep = index;
  steps.forEach((step) => step.classList.remove('active'));
  navItems.forEach((item) => item.classList.remove('active'));
  steps[index].classList.add('active');
  navItems[index].classList.add('active');
  prevButton.disabled = index === 0;
  nextButton.textContent = index === steps.length - 1 ? 'Finish' : 'Next Step';
  updateProgress();
  saveState();
};

const updateData = (event) => {
  const { name, type } = event.target;
  if (!name) {
    return;
  }
  if (type === 'checkbox') {
    state.data[name] = event.target.checked;
  } else {
    state.data[name] = event.target.value;
  }
  saveState();
  updateProgress();
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
    const value = state.data[key];
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
  link.download = `${state.data.title || 'crucible-project'}-backup.json`;
  link.click();
  URL.revokeObjectURL(url);
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
    if (state.currentStep < steps.length - 1) {
      showStep(state.currentStep + 1);
    }
  });

  prevButton.addEventListener('click', () => {
    if (state.currentStep > 0) {
      showStep(state.currentStep - 1);
    }
  });
};

const bindInputs = () => {
  document.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', updateData);
  });
};

buildBeatCards();
loadState();
initMovementSelector();
wireAiButtons();
bindNavigation();
bindInputs();
showStep(state.currentStep);

exportButton.addEventListener('click', generateExport);
downloadButton.addEventListener('click', downloadExport);
phaseSelect.addEventListener('change', saveState);
