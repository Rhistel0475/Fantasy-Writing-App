import { create } from "zustand";

const STORAGE_KEY = "crucible.project.v1";

type Project = {
  id: string;
  meta: { author: string; title: string; genre: string; targetWordCount: number };
  mercy: { early: string; brewing: string; paidOff: string };
};

function defaultProject(): Project {
  return {
    id: crypto.randomUUID(),
    meta: { author: "", title: "", genre: "", targetWordCount: 90000 },
    mercy: { early: "", brewing: "", paidOff: "" },
  };
}

type State = {
  project: Project | null;
  setProject: (p: Project) => void;
  createProject: () => Project;
  loadProject: () => Project | null;
};

export const useProjectStore = create<State>((set) => ({
  project: null,
  setProject: (p) => set({ project: p }),
  createProject: () => {
    const p = defaultProject();
    set({ project: p });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return p;
  },
  loadProject: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ project: null });
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Project;
      set({ project: parsed });
      return parsed;
    } catch {
      set({ project: null });
      return null;
    }
  },
}));
