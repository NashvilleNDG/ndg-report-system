"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { periodLabel } from "@/lib/report-utils";

interface Report {
  id: string;
  period: string;
  status: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  contactEmail: string | null;
  isActive: boolean;
  reports: Report[];
  driveConfig: { lastSyncedAt: string | null; syncStatus: string | null } | null;
}

export default function AdminClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/clients/${clientId}`);
    if (res.ok) {
      const data = await res.json();
      // fetch reports separately
      const rRes = await fetch(`/api/reports?clientId=${clientId}`);
      const reports = rRes.ok ? await rRes.json() : [];
      setClient({ ...data, reports });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const togglePublish = async (report: Report) => {
    setPublishing(report.id);
    const newStatus = report.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setClient((prev) =>
        prev
          ? {
              ...prev,
              reports: prev.reports.map((r) =>
                r.id === report.id ? { ...r, status: newStatus } : r
              ),
            }
          : prev
      );
    }
    setPublishing(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (!client) return <div className="text-red-500 p-6">Client not found.</div>;

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
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Reports ({client.reports.length})</h2>
          <p className="text-xs text-gray-400 mt-0.5">Publish a report to make it visible to the client.</p>
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
            <tbody className="divide-y divide-gray-100">
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
                      <button
                        onClick={() => togglePublish(r)}
                        disabled={publishing === r.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          r.status === "PUBLISHED"
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {publishing === r.id
                          ? "…"
                          : r.status === "PUBLISHED"
                          ? "Unpublish"
                          : "Publish"}
                      </button>
                      <Link
                        href={`/team/preview/${client.id}/${r.period}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        👁 Preview
                      </Link>
                      <Link
                        href={`/team/entry/${client.id}/${r.period}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                      >
                        Edit Data
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
