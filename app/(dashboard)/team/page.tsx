"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { currentPeriod } from "@/lib/report-utils";

interface Client {
  id: string;
  name: string;
  industry: string | null;
  isActive: boolean;
}

interface ReportStatus {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  readyForReview: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_CONFIG = {
  PUBLISHED: {
    label: "Published",
    bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    cardBorder: "border-emerald-100",
    order: 2,
  },
  DRAFT: {
    label: "Draft",
    bg: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    cardBorder: "border-amber-100",
    order: 1,
  },
  NOT_STARTED: {
    label: "Not Started",
    bg: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-300",
    cardBorder: "border-gray-100",
    order: 0,
  },
} as const;

export default function TeamDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [reportMap, setReportMap] = useState<Record<string, ReportStatus>>({});
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod());
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch client list once
  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setClients(data); setLoadingClients(false); });
  }, []);

  // Re-fetch report statuses whenever the selected month changes
  useEffect(() => {
    if (!selectedMonth) return;
    setLoadingReports(true);
    fetch(`/api/reports?period=${selectedMonth}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((reports: Array<{ clientId: string; id: string; status: string; updatedAt: string; readyForReview: boolean }>) => {
        const map: Record<string, ReportStatus> = {};
        reports.forEach((r) => {
          map[r.clientId] = {
            id: r.id,
            status: r.status as "DRAFT" | "PUBLISHED",
            updatedAt: r.updatedAt,
            readyForReview: r.readyForReview ?? false,
          };
        });
        setReportMap(map);
        setLoadingReports(false);
      });
  }, [selectedMonth]);

  const activeClients = clients.filter((c) => c.isActive);

  const filteredClients = search.trim()
    ? activeClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : activeClients;

  // Sort: NOT_STARTED → DRAFT → PUBLISHED
  const sortedClients = [...filteredClients].sort((a, b) => {
    const aOrder = STATUS_CONFIG[reportMap[a.id]?.status ?? "NOT_STARTED"].order;
    const bOrder = STATUS_CONFIG[reportMap[b.id]?.status ?? "NOT_STARTED"].order;
    return aOrder - bOrder;
  });

  const publishedCount  = activeClients.filter((c) => reportMap[c.id]?.status === "PUBLISHED").length;
  const draftCount      = activeClients.filter((c) => reportMap[c.id]?.status === "DRAFT").length;
  const notStartedCount = activeClients.length - publishedCount - draftCount;
  const reviewCount     = activeClients.filter((c) => reportMap[c.id]?.readyForReview).length;

  // Month navigation helpers
  const changeMonth = (delta: number) => {
    if (!selectedMonth) return;
    const [y, m] = selectedMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const displayMonth = (() => {
    if (!selectedMonth) return "";
    const [year, month] = selectedMonth.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    );
  })();

  return (
    <div className="space-y-6 page-content">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a reporting period, then enter data for each client.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              {reviewCount} awaiting review
            </span>
          )}
          <Link
            href="/team/upload"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Drive Sync
          </Link>
        </div>
      </div>

      {/* ── Period Selector ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Reporting Period</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Entering data for:{" "}
                <span className="font-semibold text-indigo-600">{displayMonth}</span>
              </p>
            </div>
          </div>

          {/* Prev / Input / Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-gray-500 transition-colors"
              title="Previous month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
            <button
              onClick={() => changeMonth(1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-gray-500 transition-colors"
              title="Next month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {!loadingClients && activeClients.length > 0 && (
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Completion Stats ────────────────────────────────────────────────── */}
      {activeClients.length > 0 && !loadingClients && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Published",   count: publishedCount,  color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100", dot: "bg-emerald-500" },
            { label: "In Progress", count: draftCount,      color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-100",   dot: "bg-amber-400" },
            { label: "Not Started", count: notStartedCount, color: "text-gray-500",    bg: "bg-gray-50",     border: "border-gray-100",    dot: "bg-gray-300" },
          ].map(({ label, count, color, bg, border, dot }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-3`}>
              <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
              <div>
                <p className={`text-xl font-black ${color} leading-none`}>{count}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Client Cards ────────────────────────────────────────────────────── */}
      {loadingClients ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : activeClients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-400 font-medium">No active clients found.</p>
          <p className="text-xs text-gray-300 mt-1">Ask an admin to add and activate clients.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {search
              ? `${sortedClients.length} of ${activeClients.length} client${activeClients.length !== 1 ? "s" : ""} match`
              : `${activeClients.length} active client${activeClients.length !== 1 ? "s" : ""} — ${
                  publishedCount === activeClients.length
                    ? "🎉 All reports published!"
                    : `${activeClients.length - publishedCount} still need${activeClients.length - publishedCount === 1 ? "s" : ""} attention`
                }`}
          </p>

          {sortedClients.length === 0 && search ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400 font-medium">No clients match &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch("")} className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 font-medium">
                Clear search
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {sortedClients.map((client) => {
              const report        = reportMap[client.id];
              const statusKey     = report?.status ?? "NOT_STARTED";
              const cfg           = STATUS_CONFIG[statusKey];
              const hasReport     = !!report;
              const inReview      = report?.readyForReview ?? false;

              return (
                <div
                  key={client.id}
                  className={`bg-white rounded-2xl shadow-sm border ${cfg.cardBorder} p-5 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
                >
                  {/* Client info + status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                        <span className="text-white font-black text-sm">{client.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 truncate">{client.name}</h2>
                        {client.industry && (
                          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-100">
                            {client.industry}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status / review badges */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${cfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {inReview && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          Review Requested
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last saved */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {loadingReports ? (
                        <span className="w-16 h-3 bg-gray-100 rounded animate-pulse inline-block" />
                      ) : hasReport ? (
                        <span>Saved <span className="font-medium text-gray-600">{timeAgo(report.updatedAt)}</span></span>
                      ) : (
                        <span className="text-gray-300">No data entered</span>
                      )}
                    </div>
                    <span className="font-medium text-gray-500">{displayMonth}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <Link
                      href={`/team/entry/${client.id}/${selectedMonth}`}
                      className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                        statusKey === "PUBLISHED"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {hasReport ? "Edit Data" : "Enter Data"}
                    </Link>
                    <Link
                      href={`/team/preview/${client.id}/${selectedMonth}`}
                      className="px-3 text-center bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center"
                      title="Preview report"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
