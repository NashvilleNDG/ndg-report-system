interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: string;
}

export default function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      {change !== undefined && (
        <div
          className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full w-fit ${
            positive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span>{positive ? "▲" : "▼"}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
