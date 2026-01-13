import { create } from "zustand";

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
};

export const useProjectStore = create<State>((set) => ({
  project: null,
  setProject: (p) => set({ project: p }),
  createProject: () => {
    const p = defaultProject();
    set({ project: p });
    localStorage.setItem("crucible.project", JSON.stringify(p));
    return p;
  },
}));
