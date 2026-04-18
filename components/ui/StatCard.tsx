interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: string;
  accent?: "indigo" | "pink" | "blue" | "red" | "teal" | "orange" | "violet" | "emerald" | "sky";
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, { border: string; glow: string }> = {
  indigo:  { border: "border-l-indigo-500",  glow: "hover:shadow-indigo-100/50" },
  pink:    { border: "border-l-pink-500",    glow: "hover:shadow-pink-100/50" },
  blue:    { border: "border-l-blue-500",    glow: "hover:shadow-blue-100/50" },
  red:     { border: "border-l-red-500",     glow: "hover:shadow-red-100/50" },
  teal:    { border: "border-l-teal-500",    glow: "hover:shadow-teal-100/50" },
  orange:  { border: "border-l-orange-500",  glow: "hover:shadow-orange-100/50" },
  violet:  { border: "border-l-violet-500",  glow: "hover:shadow-violet-100/50" },
  emerald: { border: "border-l-emerald-500", glow: "hover:shadow-emerald-100/50" },
  sky:     { border: "border-l-sky-500",     glow: "hover:shadow-sky-100/50" },
};

export default function StatCard({ label, value, change, positive, icon, accent = "indigo" }: StatCardProps) {
  const { border, glow } = ACCENT_STYLES[accent];
  return (
    <div className={`relative bg-white rounded-xl border border-gray-100 border-l-4 ${border} p-4 flex flex-col gap-1.5 transition-all duration-200 hover:shadow-lg ${glow} hover:-translate-y-0.5 overflow-hidden`}>
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</span>
        {icon && <span className="text-base leading-none opacity-70">{icon}</span>}
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight tabular-nums leading-none mt-1">{value}</div>
      {change !== undefined && (
        <div
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-0.5 ${
            positive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          <span>{positive ? "▲" : "▼"}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
