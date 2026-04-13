"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
}

interface DriveConfig {
  driveFileId: string;
  driveFileName: string | null;
  sheetName: string | null;
  lastSyncedAt: string | null;
  syncStatus: string | null;
}

function DriveConfigRow({ client }: { client: Client }) {
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [form, setForm] = useState({ driveFileId: "", sheetName: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/sync/drive?clientId=${client.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setConfig(data);
          setForm({ driveFileId: data.driveFileId ?? "", sheetName: data.sheetName ?? "" });
        }
      });
  }, [client.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/sync/drive/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setConfig(data);
      setMsg("Saved!");
    } else {
      setMsg(data.error ?? "Save failed");
    }
    setSaving(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{client.name}</h3>
        {config?.lastSyncedAt && (
          <span className="text-xs text-gray-400">
            Last synced: {new Date(config.lastSyncedAt).toLocaleString()}
          </span>
        )}
      </div>
      {config?.syncStatus && (
        <div className={`text-xs mb-3 font-medium px-2 py-1 rounded inline-block ${
          config.syncStatus === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {config.syncStatus}
        </div>
      )}
      <form onSubmit={handleSave} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Drive File ID</label>
          <input
            type="text"
            required
            value={form.driveFileId}
            onChange={(e) => setForm((f) => ({ ...f, driveFileId: e.target.value }))}
            placeholder="Google Drive file ID"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sheet Name</label>
          <input
            type="text"
            value={form.sheetName}
            onChange={(e) => setForm((f) => ({ ...f, sheetName: e.target.value }))}
            placeholder="Sheet1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage Google Drive integrations and templates.</p>
      </div>

      {/* Google Drive Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📁</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Google Drive</h2>
            <p className="text-sm text-gray-500">Configure the Drive file and sheet for each client.</p>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading clients…</p>
        ) : clients.length === 0 ? (
          <p className="text-gray-400 text-sm">No clients found. Create clients first.</p>
        ) : (
          <div className="space-y-4">
            {clients.map((c) => <DriveConfigRow key={c.id} client={c} />)}
          </div>
        )}
      </div>

      {/* Download Template Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📥</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Download Template</h2>
            <p className="text-sm text-gray-500">Download the Excel template for data entry.</p>
          </div>
        </div>
        <a
          href="/api/template"
          download
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Template (.xlsx)
        </a>
      </div>
    </div>
  );
}
