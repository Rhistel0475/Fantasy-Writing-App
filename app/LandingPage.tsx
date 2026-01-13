import { BeginJourneyButton } from "./BeginJourneyButton";
import GlassCard from "./GlassCard";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-black via-slate-950 to-black px-4 pb-24 pt-16 text-slate-100">
      <div className="mx-auto max-w-md space-y-10">
        {/* Hero text */}
        <p className="text-center text-lg leading-relaxed text-slate-300">
          A comprehensive narrative framework designed to guide fantasy authors
          through the complete novel-writing journey with a{" "}
          <span className="text-amber-400">36-beat structure</span> and three
          interwoven story strands.
        </p>

        {/* Cards */}
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

        {/* CTA */}
        <BeginJourneyButton />
      </div>
    </main>
  );
}
