"use client";

import { useRouter } from "next/navigation";

import { useProjectStore } from "./useProjectStore";

export function BeginJourneyButton() {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);

  return (
    <button
      className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-lg font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:brightness-110"
      onClick={() => {
        createProject();
        router.push("/project-forge");
      }}
    >
      Begin Your Journey →
    </button>
  );
}
