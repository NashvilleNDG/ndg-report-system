import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, reportsThisMonth, publishedReports, recentClients] =
    await Promise.all([
      prisma.client.count(),
      prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.report.count({ where: { status: "PUBLISHED" } }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          industry: true,
          isActive: true,
          _count: { select: { reports: true } },
        },
      }),
    ]);

  const stats = [
    { label: "Total Clients", value: totalClients, icon: "🏢", color: "text-blue-600" },
    { label: "Reports This Month", value: reportsThisMonth, icon: "📊", color: "text-indigo-600" },
    { label: "Published Reports", value: publishedReports, icon: "✅", color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4"
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Recent Clients</h2>
          <Link
            href="/admin/clients"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Industry", "Reports", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/admin/clients/${client.id}`} className="hover:text-indigo-600">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{client.industry ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-700">{client._count.reports}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        client.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No clients yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
