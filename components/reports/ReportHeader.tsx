import { periodLabel } from "@/lib/report-utils";
import Link from "next/link";

interface ReportHeaderProps {
  clientName: string;
  period: string;
  status: string;
  updatedAt?: Date | string | null;
}

export default function ReportHeader({ clientName, period, status, updatedAt }: ReportHeaderProps) {
  const isPublished = status === "PUBLISHED";
  const [year, month] = period.split("-");
  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString("en-US", { month: "long" });

  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-lg shadow-indigo-200/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-white/20">
            <span className="text-white text-xs font-bold leading-tight">{monthName.slice(0, 3).toUpperCase()}</span>
            <span className="text-white/70 text-xs leading-tight">{year}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{clientName}</h1>
            <p className="text-indigo-200 text-sm mt-0.5">{periodLabel(period)} Performance Report</p>
            {lastUpdated && (
              <p className="text-indigo-300 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated {lastUpdated}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
              isPublished
                ? "bg-emerald-400/20 text-emerald-100 border border-emerald-400/30"
                : "bg-amber-400/20 text-amber-100 border border-amber-400/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
            {isPublished ? "Published" : "Draft"}
          </span>
          <Link
            href="/api/template"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl transition-colors border border-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Template
          </Link>
        </div>
      </div>
    </div>
  );
}
