export default function GlassCard({ icon, title, titleColor, children }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        {icon}
      </div>

      <h3 className={`text-center text-xl font-semibold uppercase tracking-wide ${titleColor}`}>
        {title}
      </h3>

      <p className="mt-3 text-center text-sm text-slate-300">
    <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-lg">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <h3 className={`text-center text-xl font-semibold ${titleColor}`}>
        {title}
      </h3>

      <p className="mt-2 text-center text-sm text-slate-300">
        {children}
      </p>
    </div>
  );
}
