"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProjectStore } from "../useProjectStore";

export default function ProjectForgePage() {
  const router = useRouter();
  const project = useProjectStore((s) => s.project);
  const loadProject = useProjectStore((s) => s.loadProject);

  useEffect(() => {
    const loaded = project ?? loadProject();
    if (!loaded) {
      router.replace("/");
    }
  }, [loadProject, project, router]);

  if (!project) {
    return (
      <main className="min-h-dvh bg-black px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-xl text-center text-slate-300">
          Loading your project...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400/80">
            Project Forge
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {project.meta.title || "Untitled Project"}
          </h1>
          <p className="mt-2 text-slate-300">
            Author: {project.meta.author || "Unknown"} · Genre:{" "}
            {project.meta.genre || "Unspecified"} · Target:{" "}
            {project.meta.targetWordCount.toLocaleString()} words
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-amber-200">Mercy Thread</h2>
          <p className="mt-2 text-slate-300">
            Early Mercy: {project.mercy.early || "Not set"}
          </p>
          <p className="text-slate-300">
            Brewing: {project.mercy.brewing || "Not set"}
          </p>
          <p className="text-slate-300">
            Paid Off: {project.mercy.paidOff || "Not set"}
          </p>
        </div>
      </div>
    </main>
  );
}
