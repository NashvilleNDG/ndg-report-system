import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { currentPeriod, periodLabel } from "@/lib/report-utils";
import AdminChartWrapper from "@/components/charts/AdminChartWrapper";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const period = currentPeriod();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalClients,
    activeClients,
    reportsThisMonth,
    publishedThisMonth,
    draftReports,
    prevMonthPublished,
    allActiveClients,
    recentActivity,
    publishedByPeriod,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
    prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.report.count({ where: { status: "PUBLISHED", publishedAt: { gte: startOfMonth } } }),
    prisma.report.count({ where: { status: "DRAFT" } }),
    prisma.report.count({ where: { status: "PUBLISHED", publishedAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    // All active clients with their current period report status
    prisma.client.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        industry: true,
        reports: {
          where: { period },
          select: { id: true, status: true, updatedAt: true },
          take: 1,
        },
      },
    }),
    // 5 most recently updated reports for activity feed
    prisma.report.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        period: true,
        status: true,
        updatedAt: true,
        client: { select: { id: true, name: true } },
      },
    }),
    // Published counts for last 6 months
    prisma.report.groupBy({
      by: ["period"],
      where: {
        status: "PUBLISHED",
        period: { gte: (() => { const d = new Date(); d.setMonth(d.getMonth() - 5); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })() }
      },
      _count: { id: true },
      orderBy: { period: "asc" }
    }),
  ]);

  const publishedTrend = prevMonthPublished > 0
    ? Math.round(((publishedThisMonth - prevMonthPublished) / prevMonthPublished) * 100)
    : null;

  // Client report status for current month
  const withReport = allActiveClients.filter((c) => c.reports.length > 0);
  const withoutReport = allActiveClients.filter((c) => c.reports.length === 0);
  const publishedCount = allActiveClients.filter((c) => c.reports[0]?.status === "PUBLISHED").length;
  const draftCount = allActiveClients.filter((c) => c.reports[0]?.status === "DRAFT").length;
  const completionPct = activeClients > 0 ? Math.round((withReport.length / activeClients) * 100) : 0;

  const monthDisplay = periodLabel(period);

  // Format groupBy results into chart-friendly shape: "Nov 24", "Dec 24", etc.
  const chartData = publishedByPeriod.map((row) => {
    const [year, month] = row.period.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return { month: label, count: row._count.id };
  });
  const totalPublishedSixMonths = chartData.reduce((sum, r) => sum + r.count, 0);

  function timeAgo(date: Date | string) {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="space-y-7 page-content">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" · "}
            <span className="font-medium text-indigo-600">Reporting period: {monthDisplay}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Enter Data
          </Link>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Client
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">

        {/* Active Clients */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50 hover-lift col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide">Active Clients</p>
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums">{activeClients}</p>
          <p className="text-indigo-200 text-xs mt-1">{totalClients} total accounts</p>
        </div>

        {/* Reports This Month — clickable */}
        <Link href="/admin/reports" className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-violet-200/50 hover-lift col-span-1 block group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide">Reports Created</p>
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums">{reportsThisMonth}</p>
          <p className="text-violet-200 text-xs mt-1 flex items-center gap-1">
            This month
            <svg className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </Link>

        {/* Published This Month */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50 hover-lift col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Published</p>
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums">{publishedThisMonth}</p>
          {publishedTrend !== null ? (
            <p className="text-emerald-100 text-xs mt-1 flex items-center gap-1">
              <span>{publishedTrend >= 0 ? "▲" : "▼"} {Math.abs(publishedTrend)}% vs last month</span>
            </p>
          ) : (
            <p className="text-emerald-100 text-xs mt-1">This month</p>
          )}
        </div>

        {/* Drafts Pending */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-200/50 hover-lift col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-amber-100 text-xs font-semibold uppercase tracking-wide">Drafts Pending</p>
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-black tabular-nums">{draftReports}</p>
          <p className="text-amber-100 text-xs mt-1">Awaiting publish</p>
        </div>
      </div>

      {/* ── Main 2-column grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Client Report Status (current month) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {monthDisplay} — Client Report Status
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {withReport.length} of {activeClients} clients have a report this month
                </p>
              </div>
              {/* Completion gauge */}
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-black text-indigo-600 tabular-nums">{completionPct}%</p>
                <p className="text-xs text-gray-400">complete</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct === 100
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : completionPct >= 60
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "linear-gradient(90deg, #f59e0b, #f97316)",
                }}
              />
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3">
              {[
                { label: "Published", count: publishedCount, color: "bg-emerald-500" },
                { label: "Draft", count: draftCount, color: "bg-amber-400" },
                { label: "Missing", count: withoutReport.length, color: "bg-gray-300" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-xs text-gray-500 font-medium">{s.label}: <span className="font-bold text-gray-800">{s.count}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Client list */}
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {allActiveClients.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">No active clients.</div>
            ) : allActiveClients.map((client) => {
              const report = client.reports[0];
              const status: "DRAFT" | "PUBLISHED" | "MISSING" = report?.status ?? "MISSING";
              const statusConfig = {
                PUBLISHED: { label: "Published", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
                DRAFT:     { label: "Draft",     bg: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400" },
                MISSING:   { label: "Missing",   bg: "bg-gray-100 text-gray-500 border-gray-200",      dot: "bg-gray-400" },
              }[status];

              return (
                <div key={client.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-bold text-xs">{client.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{client.name}</p>
                      {client.industry && <p className="text-xs text-gray-400 truncate">{client.industry}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig?.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig?.dot}`} />
                      {statusConfig?.label}
                    </span>
                    {!report ? (
                      <Link
                        href={`/team/entry/${client.id}/${period}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        + Enter Data
                      </Link>
                    ) : status === "DRAFT" ? (
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Publish →
                      </Link>
                    ) : (
                      <Link
                        href={`/team/preview/${client.id}/${period}`}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Preview
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest report updates</p>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-gray-400">No recent activity.</p>
              ) : recentActivity.map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${r.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.client.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {periodLabel(r.period)} · {r.status === "PUBLISHED" ? "Published" : "Updated draft"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300 whitespace-nowrap flex-shrink-0">{timeAgo(r.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Published Reports — Last 6 Months */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 leading-tight">Published This Year</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalPublishedSixMonths} report{totalPublishedSixMonths !== 1 ? "s" : ""} over the last 6 months
                  </p>
                </div>
              </div>
            </div>
            <div className="px-3 pt-3 pb-2">
              <AdminChartWrapper data={chartData} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                {
                  href: "/admin/clients",
                  label: "Manage Clients",
                  desc: "View & edit client profiles",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  color: "bg-indigo-50 text-indigo-600",
                },
                {
                  href: "/admin/users",
                  label: "Manage Users",
                  desc: "Create & edit user accounts",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  ),
                  color: "bg-violet-50 text-violet-600",
                },
                {
                  href: "/team",
                  label: "Enter Report Data",
                  desc: "Add this month's metrics",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  ),
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  href: "/team/upload",
                  label: "Upload Excel / Drive",
                  desc: "Import data from spreadsheet",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  ),
                  color: "bg-sky-50 text-sky-600",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">{action.label}</p>
                    <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
