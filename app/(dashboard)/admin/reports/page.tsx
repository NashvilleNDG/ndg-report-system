"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { periodLabel } from "@/lib/report-utils";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface Report {
  id: string;
  period: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  updatedAt: string;
  client: { name: string };
  clientId: string;
}

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft",     value: "DRAFT"     },
];

const STATUS_STYLES = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  DRAFT:     "bg-amber-50  text-amber-700  border border-amber-200",
};
const STATUS_DOT = {
  PUBLISHED: "bg-emerald-500",
  DRAFT:     "bg-amber-400",
};

// ── Small reusable select ────────────────────────────────────────────────────
function FilterSelect({
  icon,
  value,
  onChange,
  children,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer hover:bg-gray-50 transition-colors font-medium"
      >
        {children}
      </select>
      {/* chevron */}
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

// ── Publish-confirm modal ────────────────────────────────────────────────────
interface PublishDialogState {
  open: boolean;
  report: Report | null;
}

function PublishEmailModal({
  report,
  onChoice,
  onCancel,
}: {
  report: Report;
  onChoice: (sendEmail: boolean) => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Send report via email?</h2>
        <p className="text-sm text-gray-500 mb-1">
          You&apos;re publishing the <span className="font-semibold text-gray-700">{periodLabel(report.period)}</span> report
          for <span className="font-semibold text-gray-700">{report.client.name}</span>.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Would you like to notify the client by email with a PDF attachment?
        </p>

        <div className="flex flex-col gap-2.5">
          {/* Yes — send email */}
          <button
            onClick={() => onChoice(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Yes, publish &amp; send email
          </button>

          {/* No — just publish */}
          <button
            onClick={() => onChoice(false)}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors border border-emerald-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No, just publish (no email)
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="w-full text-sm text-gray-400 hover:text-gray-600 font-medium py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [reports,      setReports]      = useState<Report[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");   // clientId or "ALL"
  const [periodFilter, setPeriodFilter] = useState("ALL");   // "YYYY-MM" or "ALL"
  const [search,       setSearch]       = useState("");
  const [togglingId,   setTogglingId]   = useState<string | null>(null);
  const [publishDialog, setPublishDialog] = useState<PublishDialogState>({ open: false, report: null });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/reports");
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Derived option lists ──────────────────────────────────────────────────
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach((r) => map.set(r.clientId, r.client.name));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [reports]);

  const periodOptions = useMemo(() => {
    const set = new Set(reports.map((r) => r.period));
    return Array.from(set).sort((a, b) => b.localeCompare(a)); // newest first
  }, [reports]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return reports
      .filter((r) => statusFilter === "ALL" || r.status === statusFilter)
      .filter((r) => clientFilter === "ALL" || r.clientId === clientFilter)
      .filter((r) => periodFilter === "ALL" || r.period === periodFilter)
      .filter((r) =>
        search === "" ||
        r.client.name.toLowerCase().includes(search.toLowerCase()) ||
        r.period.includes(search) ||
        periodLabel(r.period).toLowerCase().includes(search.toLowerCase())
      );
  }, [reports, statusFilter, clientFilter, periodFilter, search]);

  const counts = {
    ALL:       reports.length,
    PUBLISHED: reports.filter((r) => r.status === "PUBLISHED").length,
    DRAFT:     reports.filter((r) => r.status === "DRAFT").length,
  };

  const hasActiveFilters = clientFilter !== "ALL" || periodFilter !== "ALL" || search !== "";

  const clearFilters = () => {
    setClientFilter("ALL");
    setPeriodFilter("ALL");
    setSearch("");
  };

  // ── Toggle publish ────────────────────────────────────────────────────────
  // Unpublish fires immediately; Publish opens the email-choice modal first.
  const handlePublishClick = (report: Report) => {
    if (report.status === "PUBLISHED") {
      // Unpublish — no email involved, do it straight away
      void executeToggle(report, false);
    } else {
      // Show modal asking whether to send email
      setPublishDialog({ open: true, report });
    }
  };

  const handlePublishChoice = async (sendEmail: boolean) => {
    const report = publishDialog.report;
    setPublishDialog({ open: false, report: null });
    if (!report) return;
    await executeToggle(report, sendEmail);
  };

  const executeToggle = async (report: Report, sendEmail: boolean) => {
    setTogglingId(report.id);
    const newStatus = report.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, sendEmail }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? { ...r, status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : r.publishedAt }
              : r
          )
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  // ── Format period option label ────────────────────────────────────────────
  function periodOptionLabel(p: string) {
    const [y, m] = p.split("-");
    const name = new Date(parseInt(y), parseInt(m) - 1, 1)
      .toLocaleDateString("en-US", { month: "long" });
    return `${name} ${y}`;
  }

  return (
    <div className="space-y-6 page-content">

      {/* ── Publish email modal ──────────────────────────────────────────────── */}
      {publishDialog.open && publishDialog.report && (
        <PublishEmailModal
          report={publishDialog.report}
          onChoice={handlePublishChoice}
          onCancel={() => setPublishDialog({ open: false, report: null })}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {reports.length} report{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Enter Data
        </Link>
      </div>

      {/* ── Status tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              statusFilter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filter row: Client + Period dropdowns + Search ──────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Client dropdown */}
        <FilterSelect
          value={clientFilter}
          onChange={setClientFilter}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <option value="ALL">All Clients</option>
          {clientOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </FilterSelect>

        {/* Period / Month-Year dropdown */}
        <FilterSelect
          value={periodFilter}
          onChange={setPeriodFilter}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          <option value="ALL">All Months</option>
          {periodOptions.map((p) => (
            <option key={p} value={p}>{periodOptionLabel(p)}</option>
          ))}
        </FilterSelect>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {/* Search */}
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or period…"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm w-56"
          />
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {["Client", "Period", "Status", "Last Updated", "Published", ""].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={6} cols={6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-400 text-sm">No reports match the selected filters.</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-indigo-600 text-xs font-semibold hover:underline mt-1">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Client */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-xs">{r.client.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <Link
                        href={`/admin/clients/${r.clientId}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors group flex items-center gap-1"
                        title={`View ${r.client.name} details`}
                      >
                        {r.client.name}
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors -mb-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setPeriodFilter(r.period)}
                      className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                      title={`Filter by ${periodLabel(r.period)}`}
                    >
                      {periodLabel(r.period)}
                    </button>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                      {r.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(r.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>

                  {/* Published At */}
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <Link
                        href={`/team/entry/${r.clientId}/${r.period}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </Link>

                      {/* Publish / Unpublish */}
                      <button
                        onClick={() => handlePublishClick(r)}
                        disabled={togglingId === r.id}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          r.status === "PUBLISHED"
                            ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                            : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {togglingId === r.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : r.status === "PUBLISHED" ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {togglingId === r.id ? "…" : r.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>

                      {/* Preview */}
                      <Link
                        href={`/team/preview/${r.clientId}/${r.period}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
