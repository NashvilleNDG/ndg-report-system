"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { periodLabel } from "@/lib/report-utils";

interface Report {
  id: string;
  period: string;
  status: string;
  notes: string | null;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  contactEmail: string | null;
  isActive: boolean;
  driveConfig: { lastSyncedAt: string | null; syncStatus: string | null } | null;
}

export default function AdminClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [client, setClient] = useState<Client | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish state
  const [publishing, setPublishing] = useState<string | null>(null);

  // Edit client modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", industry: "", contactEmail: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete report state
  const [deletingReport, setDeletingReport] = useState<string | null>(null);

  const deleteReport = async (reportId: string, period: string) => {
    if (!confirm(`Delete report for ${periodLabel(period)}? This cannot be undone.`)) return;
    setDeletingReport(reportId);
    const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
    setDeletingReport(null);
  };

  // Notes state
  const [notesEditing, setNotesEditing] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [notesSaving, setNotesSaving] = useState<string | null>(null);

  const load = async () => {
    const [clientRes, reportsRes] = await Promise.all([
      fetch(`/api/clients/${clientId}`),
      fetch(`/api/reports?clientId=${clientId}`),
    ]);
    if (clientRes.ok) setClient(await clientRes.json());
    if (reportsRes.ok) setReports(await reportsRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  // Open edit modal pre-filled
  const openEdit = () => {
    if (!client) return;
    setEditForm({
      name: client.name,
      industry: client.industry ?? "",
      contactEmail: client.contactEmail ?? "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          industry: editForm.industry || undefined,
          contactEmail: editForm.contactEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
      setClient((prev) => prev ? { ...prev, ...data } : prev);
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  };

  const togglePublish = async (report: Report) => {
    setPublishing(report.id);
    const newStatus = report.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => r.id === report.id ? { ...r, status: newStatus } : r)
      );
    }
    setPublishing(null);
  };

  const startEditNotes = (report: Report) => {
    setNotesDraft((d) => ({ ...d, [report.id]: report.notes ?? "" }));
    setNotesEditing(report.id);
  };

  const saveNotes = async (reportId: string) => {
    setNotesSaving(reportId);
    const notes = notesDraft[reportId] ?? "";
    const res = await fetch(`/api/reports/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => r.id === reportId ? { ...r, notes } : r)
      );
    }
    setNotesEditing(null);
    setNotesSaving(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-gray-400 text-sm">Loading client…</span>
      </div>
    </div>
  );
  if (!client) return <div className="text-red-500 p-6">Client not found.</div>;

  return (
    <div className="space-y-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/clients" className="text-gray-400 hover:text-indigo-600 transition-colors font-medium">Clients</Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700 font-semibold">{client.name}</span>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                <span className="text-white font-black text-xl">{client.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{client.name}</h1>
                <p className="text-slate-400 font-mono text-xs mt-0.5">{client.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                client.isActive
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-gray-400/20 text-gray-300 border border-gray-400/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? "bg-emerald-400" : "bg-gray-400"}`} />
                {client.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={openEdit}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Industry</p>
            <p className="text-gray-800 font-medium">{client.industry ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Contact Email</p>
            <p className="text-gray-800 font-medium">{client.contactEmail ?? "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Drive Sync</p>
            <p className="text-gray-800 font-medium">
              {client.driveConfig?.lastSyncedAt
                ? new Date(client.driveConfig.lastSyncedAt).toLocaleString()
                : "Not configured"}
            </p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Reports <span className="text-gray-400 font-normal">({reports.length})</span></h2>
            <p className="text-xs text-gray-400 mt-0.5">Publish a report to make it visible to the client.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Period", "Status", "Last Updated", "Notes", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No reports yet.</td>
                </tr>
              ) : reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors align-top">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{periodLabel(r.period)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </td>
                  {/* Notes cell */}
                  <td className="px-6 py-4 max-w-xs">
                    {notesEditing === r.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={notesDraft[r.id] ?? ""}
                          onChange={(e) => setNotesDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Add a note for the client…"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(r.id)}
                            disabled={notesSaving === r.id}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {notesSaving === r.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setNotesEditing(null)}
                            className="text-xs text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditNotes(r)}
                        className="cursor-pointer group"
                        title="Click to edit note"
                      >
                        {r.notes ? (
                          <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {r.notes}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-300 group-hover:text-indigo-400 transition-colors">
                            + Add note
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Actions cell */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => togglePublish(r)}
                        disabled={publishing === r.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                          r.status === "PUBLISHED"
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {publishing === r.id ? "…" : r.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/team/preview/${client.id}/${r.period}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors whitespace-nowrap"
                      >
                        👁 Preview
                      </Link>
                      <Link
                        href={`/team/entry/${client.id}/${r.period}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs whitespace-nowrap"
                      >
                        Edit Data
                      </Link>
                      <button
                        onClick={() => deleteReport(r.id, r.period)}
                        disabled={deletingReport === r.id}
                        className="text-red-400 hover:text-red-600 font-medium text-xs whitespace-nowrap disabled:opacity-50"
                      >
                        {deletingReport === r.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Client Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Client</h2>
                <p className="text-xs text-gray-400 mt-0.5">Update client information</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                <input
                  type="text"
                  value={editForm.industry}
                  onChange={(e) => setEditForm((f) => ({ ...f, industry: e.target.value }))}
                  placeholder="e.g. Technology, Healthcare…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="contact@client.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>

              {editError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={editSaving || !editForm.name.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
