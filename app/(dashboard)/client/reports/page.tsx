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
    select: { id: true, period: true, status: true, publishedAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">All your published monthly reports.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {reports.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No published reports yet.</p>
            <p className="text-sm mt-1">Reports will appear here once they're published.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Period", "Published", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{periodLabel(r.period)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/client/reports/${r.period}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
