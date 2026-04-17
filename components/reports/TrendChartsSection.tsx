"use client";

import TrendChart from "./TrendChart";
import type { TrendChartConfig } from "./TrendChart";

interface TrendChartsSectionProps {
  charts: TrendChartConfig[];
}

export default function TrendChartsSection({ charts }: TrendChartsSectionProps) {
  const visible = charts.filter((c) => c.data.some((d) => d.value != null));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Historical Trends</h2>
          <p className="text-[11px] text-gray-400">Last 6 months of performance data</p>
        </div>
      </div>

      {/* Chart grid — 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((chart) => (
          <TrendChart key={chart.id} config={chart} />
        ))}
      </div>
    </div>
  );
}
