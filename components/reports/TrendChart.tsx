"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TrendPoint {
  label: string;
  value: number | null;
}

export interface TrendChartConfig {
  id: string;
  title: string;
  metric: string; // e.g. "Followers", "Sessions"
  color: string;
  data: TrendPoint[];
}

function formatVal(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-[11px] font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {val != null ? formatVal(val) : "—"}
      </p>
    </div>
  );
}

export default function TrendChart({ config }: { config: TrendChartConfig }) {
  // Only show points that have data; fill gaps with null (Recharts handles nulls with connectNulls=false)
  const hasData = config.data.some((d) => d.value != null);
  if (!hasData) return null;

  const gradientId = `grad-${config.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
            6-Month Trend
          </p>
          <p className="text-[14px] font-bold text-gray-800">{config.title}</p>
        </div>
        <div
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: `${config.color}18`,
            color: config.color,
          }}
        >
          {config.metric}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <AreaChart
          data={config.data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={formatVal}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: config.color, strokeWidth: 2, stroke: "#fff" }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
