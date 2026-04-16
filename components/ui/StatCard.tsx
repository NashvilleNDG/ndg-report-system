interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: string;
}

export default function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg leading-none">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{value}</div>
      {change !== undefined && (
        <div
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
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
