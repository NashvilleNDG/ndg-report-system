import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { periodLabel } from "@/lib/report-utils";

interface PageProps {
  params: { clientId: string };
}

export default async function AdminClientDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    include: {
      reports: {
        orderBy: { period: "desc" },
        select: { id: true, period: true, status: true, updatedAt: true },
      },
      driveConfig: { select: { lastSyncedAt: true, syncStatus: true } },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clients" className="hover:text-indigo-600">Clients</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{client.slug}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            client.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {client.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Industry</p>
            <p className="text-gray-800">{client.industry ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Contact Email</p>
            <p className="text-gray-800">{client.contactEmail ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Drive Sync</p>
            <p className="text-gray-800">
              {client.driveConfig?.lastSyncedAt
                ? new Date(client.driveConfig.lastSyncedAt).toLocaleString()
                : "Not configured"}
            </p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Reports ({client.reports.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Period", "Status", "Last Updated", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {client.reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No reports yet.</td>
                </tr>
              ) : client.reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{periodLabel(r.period)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/team/entry/${client.id}/${r.period}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                      >
                        Edit Data
                      </Link>
                      <Link
                        href={`/client/reports/${r.period}`}
                        className="text-gray-500 hover:text-gray-700 font-medium text-xs"
                      >
                        View
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
