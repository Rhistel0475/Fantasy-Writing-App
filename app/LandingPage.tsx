import { BeginJourneyButton } from "./BeginJourneyButton";
import GlassCard from "./GlassCard";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-950 via-black to-black px-4 pb-24 pt-16 text-slate-100">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
        <div className="absolute inset-0 -z-10 rounded-[48px] bg-[radial-gradient(circle_at_top,rgba(255,190,90,0.12),transparent_55%)] blur-2xl" />

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_18px_40px_rgba(255,120,40,0.35)]">
              <span className="text-3xl">🔥</span>
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm">
              ✦
            </div>
          </div>

          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Writing System
          </p>

          <h1 className="text-4xl font-semibold tracking-[0.18em] text-amber-300 md:text-6xl">
            The Crucible
          </h1>

          <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
            A comprehensive narrative framework designed to guide fantasy authors
            through the complete novel-writing journey with a{" "}
            <span className="text-amber-300">36-beat structure</span> and three
            interwoven story strands.
          </p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-3">
          <GlassCard
            title="Quest Strand"
            titleColor="text-amber-400"
            icon={<span className="text-amber-400">🗡️</span>}
          >
            The external mission, burden, or objective driving the plot forward.
          </GlassCard>

          <GlassCard
            title="Fire Strand"
            titleColor="text-orange-400"
            icon={<span className="text-orange-400">🔥</span>}
          >
            The protagonist’s inner transformation, power, or curse.
          </GlassCard>

          <GlassCard
            title="Constellation Strand"
            titleColor="text-sky-400"
            icon={<span className="text-sky-400">✦</span>}
          >
            The web of bonds, alliances, and relationships.
          </GlassCard>
        </div>

        <div className="w-full max-w-md">
          <BeginJourneyButton />
        </div>
      </div>
    </main>
  );
}
