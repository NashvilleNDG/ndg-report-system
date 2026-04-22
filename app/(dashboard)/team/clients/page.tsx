import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { periodLabel } from "@/lib/report-utils";
import Link from "next/link";

export default async function TeamClientsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const { role } = session.user;
  if (role !== "ADMIN" && role !== "TEAM") redirect("/login");

  // Fetch all active clients with all their reports
  const clients = await prisma.client.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      reports: {
        orderBy: { period: "desc" },
        select: {
          id: true,
          period: true,
          status: true,
          updatedAt: true,
          publishedAt: true,
        },
      },
    },
  });

  const totalReports = clients.reduce((s, c) => s + c.reports.length, 0);
  const publishedCount = clients.reduce(
    (s, c) => s + c.reports.filter((r) => r.status === "PUBLISHED").length,
    0
  );

  return (
    <div className="space-y-6 page-content">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View all client reports — preview or download, no edits from here.
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {totalReports} total reports
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            {publishedCount} published
          </span>
        </div>
      </div>

      {/* ── Client list ─────────────────────────────────────────────────────── */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">No active clients</p>
          <p className="text-sm text-gray-400 mt-1">Ask an admin to add and activate clients.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {clients.map((client) => {
            const published = client.reports.filter((r) => r.status === "PUBLISHED").length;
            const draft     = client.reports.filter((r) => r.status === "DRAFT").length;

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Client header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200">
                    <span className="text-white font-black text-base">{client.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-900 truncate">{client.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {client.industry && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-100">
                          {client.industry}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {client.reports.length} report{client.reports.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {/* Mini stats */}
                  <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    {published > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-black text-emerald-600 leading-none">{published}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Published</p>
                      </div>
                    )}
                    {draft > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-black text-amber-500 leading-none">{draft}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Draft</p>
                      </div>
                    )}
                    {client.reports.length === 0 && (
                      <span className="text-xs text-gray-400 italic">No reports yet</span>
                    )}
                  </div>
                </div>

                {/* Reports table */}
                {client.reports.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {/* Table header */}
                    <div className="grid grid-cols-12 px-6 py-2 bg-gray-50/60">
                      <span className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period</span>
                      <span className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                      <span className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Last Updated</span>
                      <span className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</span>
                    </div>

                    {/* Report rows */}
                    {client.reports.map((report) => {
                      const isPublished = report.status === "PUBLISHED";
                      const [pYear, pMonth] = report.period.split("-").map(Number);
                      const periodDate = new Date(pYear, pMonth - 1, 1);
                      const shortMonth = periodDate.toLocaleDateString("en-US", { month: "short" });

                      return (
                        <div
                          key={report.id}
                          className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-gray-50/70 transition-colors group"
                        >
                          {/* Period */}
                          <div className="col-span-4 flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center ${isPublished ? "bg-emerald-600" : "bg-gray-100"}`}>
                              <span className={`text-[9px] font-bold uppercase leading-tight ${isPublished ? "text-emerald-200" : "text-gray-400"}`}>
                                {shortMonth}
                              </span>
                              <span className={`text-xs font-black leading-tight ${isPublished ? "text-white" : "text-gray-600"}`}>
                                {String(pYear).slice(2)}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                              {periodLabel(report.period)}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 sm:hidden">
                              {shortMonth} {String(pYear).slice(2)}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                              isPublished
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-400"}`} />
                              {isPublished ? "Published" : "Draft"}
                            </span>
                          </div>

                          {/* Last updated */}
                          <div className="col-span-3 hidden sm:block">
                            <span className="text-xs text-gray-400">
                              {new Date(report.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex items-center justify-end gap-2">
                            {/* Preview */}
                            <Link
                              href={`/team/preview/${client.id}/${report.period}`}
                              title="Preview report"
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>

                            {/* Download PDF — opens preview in new tab */}
                            <a
                              href={`/team/preview/${client.id}/${report.period}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download PDF (opens in new tab)"
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-200"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-gray-400">No reports created yet for this client.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
