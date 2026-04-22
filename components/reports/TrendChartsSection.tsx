"use client";

import { useState } from "react";
import TrendChart from "./TrendChart";
import type { TrendChartConfig } from "./TrendChart";

interface TrendChartsSectionProps {
  charts: TrendChartConfig[];
  /** Total months of data available (used to cap the toggle options) */
  totalMonths?: number;
}

type Range = 3 | 6;

export default function TrendChartsSection({ charts, totalMonths = 6 }: TrendChartsSectionProps) {
  const [range, setRange] = useState<Range>(6);

  // Trim each chart's data to the selected range (last N points)
  const visible = charts
    .map((c) => ({
      ...c,
      data: c.data.slice(-range),
    }))
    .filter((c) => c.data.some((d) => d.value != null));

  if (visible.length === 0) return null;

  const canShow3  = totalMonths >= 3;
  const canShow6  = totalMonths >= 6;

  return (
    <div className="space-y-4">
      {/* Section header + toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Historical Trends</h2>
            <p className="text-[11px] text-gray-400">
              Last {range} month{range !== 1 ? "s" : ""} of performance data
            </p>
          </div>
        </div>

        {/* 3 / 6 month toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {([3, 6] as Range[]).map((r) => {
            const disabled = r === 3 ? !canShow3 : !canShow6;
            const active   = range === r;
            return (
              <button
                key={r}
                onClick={() => !disabled && setRange(r)}
                disabled={disabled}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                  active
                    ? "bg-white text-violet-700 shadow-sm border border-violet-100"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                }`}
              >
                {r}M
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((chart) => (
          <TrendChart key={chart.id} config={chart} />
        ))}
      </div>
    </div>
  );
}
