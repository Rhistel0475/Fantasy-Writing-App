export default function GlassCard({ icon, title, titleColor, children }) {
  return (
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
