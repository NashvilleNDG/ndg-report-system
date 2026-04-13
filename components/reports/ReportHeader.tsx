import { periodLabel } from "@/lib/report-utils";
import Link from "next/link";

interface ReportHeaderProps {
  clientName: string;
  period: string;
  status: string;
}

export default function ReportHeader({ clientName, period, status }: ReportHeaderProps) {
  const isPublished = status === "PUBLISHED";
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
        <p className="text-gray-500 mt-1 text-sm">{periodLabel(period)} Report</p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            isPublished
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
        <Link
          href="/api/template"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Template
        </Link>
      </div>
    </div>
  );
}
