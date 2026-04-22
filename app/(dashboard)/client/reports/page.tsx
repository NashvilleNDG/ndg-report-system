import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { periodLabel } from "@/lib/report-utils";

export default async function ClientReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const clientId = session.user.clientId;
  if (!clientId) redirect("/client");

  const reports = await prisma.report.findMany({
    where: { clientId, status: "PUBLISHED" },
    orderBy: { period: "desc" },
    select: { id: true, period: true, status: true, publishedAt: true, updatedAt: true },
  });

  const NOW = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6 page-content">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Past Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {reports.length > 0 ? `${reports.length} published report${reports.length !== 1 ? "s" : ""} available` : "Your monthly marketing performance reports"}
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700">No reports published yet</p>
          <p className="text-sm text-gray-400 mt-1">Reports will appear here once they&apos;re ready.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {reports.map((r, i) => {
            const isLatest = i === 0;
            const isNew = r.publishedAt && (NOW - new Date(r.publishedAt).getTime()) < SEVEN_DAYS_MS;
            // Parse using local-time constructor to avoid UTC offset shifting the month back
            const [pYear, pMonth] = r.period.split("-").map(Number);
            const periodDate = new Date(pYear, pMonth - 1, 1);
            const shortMonth = periodDate.toLocaleDateString("en-US", { month: "short" });
            const shortYear = String(pYear).slice(2);
            return (
              <Link
                key={r.id}
                href={`/client/reports/${r.period}`}
                className={`group bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all duration-200 flex flex-col gap-4 ${
                  isLatest ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Period Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isLatest ? "bg-indigo-600" : "bg-gray-100"}`}>
                    <span className={`text-[10px] font-bold uppercase leading-tight ${isLatest ? "text-indigo-200" : "text-gray-400"}`}>
                      {shortMonth}
                    </span>
                    <span className={`text-base font-black leading-tight ${isLatest ? "text-white" : "text-gray-600"}`}>
                      {shortYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isNew && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        NEW
                      </span>
                    )}
                    {isLatest && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Period Name */}
                <div>
                  <h3 className={`text-base font-bold ${isLatest ? "text-indigo-900" : "text-gray-800"} group-hover:text-indigo-700 transition-colors`}>
                    {periodLabel(r.period)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </div>
                </div>

                {/* CTA */}
                <div className={`flex items-center gap-1.5 text-sm font-semibold mt-auto ${isLatest ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600"} transition-colors`}>
                  View Report
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
