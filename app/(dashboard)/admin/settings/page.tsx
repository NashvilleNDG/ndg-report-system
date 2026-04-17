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

// Collect all unique file IDs already saved across clients
function useExistingFileIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("ndg_drive_file_ids");
    if (stored) setIds(JSON.parse(stored));
  }, []);
  const addId = (id: string) => {
    setIds((prev) => {
      const next = Array.from(new Set([id, ...prev])).slice(0, 10);
      localStorage.setItem("ndg_drive_file_ids", JSON.stringify(next));
      return next;
    });
  };
  return { ids, addId };
}

function DriveConfigRow({ client, existingFileIds, onFileSaved }: {
  client: Client;
  existingFileIds: string[];
  onFileSaved: (id: string) => void;
}) {
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [form, setForm] = useState({ driveFileId: "", sheetName: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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
      if (form.driveFileId) onFileSaved(form.driveFileId);
    } else {
      setMsg(data.error ?? "Save failed");
    }
    setSaving(false);
  };

  // File IDs to show in dropdown (existing ones not already in input)
  const dropdownOptions = existingFileIds.filter((id) => id !== form.driveFileId);

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
        {/* Drive File ID with dropdown */}
        <div className="flex-1 min-w-48 relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">Drive File ID</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              required
              value={form.driveFileId}
              onChange={(e) => setForm((f) => ({ ...f, driveFileId: e.target.value }))}
              placeholder="Paste Google Drive file ID"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {dropdownOptions.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  title="Use existing file ID"
                  className="h-full px-2.5 border border-gray-200 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-gray-500 hover:text-indigo-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-72 overflow-hidden">
                    <p className="text-xs text-gray-400 px-3 pt-2.5 pb-1 font-medium uppercase tracking-wide">Recently used file IDs</p>
                    {dropdownOptions.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setForm((f) => ({ ...f, driveFileId: id })); setShowDropdown(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm font-mono text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t border-gray-100 first:border-0 truncate"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sheet Name */}
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sheet Name (tab)</label>
          <input
            type="text"
            value={form.sheetName}
            onChange={(e) => setForm((f) => ({ ...f, sheetName: e.target.value }))}
            placeholder="e.g. college-place"
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
  const { ids: existingFileIds, addId } = useExistingFileIds();

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setClients(data);
        // Pre-populate known file IDs from already-configured clients
        fetch("/api/clients")
          .then(() => {})
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  // Pre-load existing file IDs from all configs on mount
  useEffect(() => {
    if (clients.length === 0) return;
    clients.forEach((c) => {
      fetch(`/api/sync/drive?clientId=${c.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data?.driveFileId) addId(data.driveFileId); });
    });
  }, [clients]);

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
            {clients.map((c) => (
              <DriveConfigRow
                key={c.id}
                client={c}
                existingFileIds={existingFileIds}
                onFileSaved={addId}
              />
            ))}
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
