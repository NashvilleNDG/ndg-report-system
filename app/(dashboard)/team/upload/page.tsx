"use client";

import { useEffect, useRef, useState } from "react";

interface Client {
  id: string;
  name: string;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  syncStatus: string | null;
  syncError: string | null;
}

export default function TeamUploadPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Excel upload state
  const [uploadClientId, setUploadClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Drive sync state
  const [syncClientId, setSyncClientId] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setClients(data); setLoading(false); });
  }, []);

  const fetchSyncStatus = async (clientId: string) => {
    if (!clientId) return;
    const res = await fetch(`/api/sync/drive?clientId=${clientId}`);
    if (res.ok) setSyncStatus(await res.json());
    else setSyncStatus(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadClientId) return;
    setUploading(true);
    setUploadResult("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", uploadClientId);
    const res = await fetch("/api/upload/excel", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setUploadResult(`Imported ${data.imported ?? 0} period(s): ${(data.periods ?? []).join(", ")}`);
      if (fileRef.current) fileRef.current.value = "";
      setFile(null);
    } else {
      setUploadResult(`Error: ${data.error ?? "Upload failed"}`);
    }
    setUploading(false);
  };

  const handleSync = async () => {
    if (!syncClientId) return;
    setSyncing(true);
    setSyncMsg("");
    const res = await fetch("/api/sync/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: syncClientId }),
    });
    const data = await res.json();
    if (res.ok) {
      setSyncMsg(`Synced ${data.imported ?? 0} period(s).`);
      fetchSyncStatus(syncClientId);
    } else {
      setSyncMsg(`Error: ${data.error ?? "Sync failed"}`);
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Data</h1>
        <p className="text-sm text-gray-500 mt-1">Upload Excel files or sync from Google Drive.</p>
      </div>

      {/* Excel Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Upload Excel</h2>
            <p className="text-sm text-gray-500">Upload a .xlsx file to import report data.</p>
          </div>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              required
              value={uploadClientId}
              onChange={(e) => setUploadClientId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File (.xlsx)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file || !uploadClientId}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {uploading ? "Uploading…" : "Upload File"}
          </button>
          {uploadResult && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              uploadResult.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {uploadResult}
            </div>
          )}
        </form>
      </div>

      {/* Google Drive Sync */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📁</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Sync from Google Drive</h2>
            <p className="text-sm text-gray-500">Pull data from the configured Drive sheet.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              value={syncClientId}
              onChange={(e) => { setSyncClientId(e.target.value); fetchSyncStatus(e.target.value); setSyncMsg(""); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {syncClientId && syncStatus && (
            <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex gap-2">
                <span className="text-gray-400">Last synced:</span>
                <span>{syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : "Never"}</span>
              </div>
              {syncStatus.syncStatus && (
                <div className="flex gap-2 items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    syncStatus.syncStatus === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{syncStatus.syncStatus}</span>
                </div>
              )}
              {syncStatus.syncError && (
                <div className="text-red-600 text-xs">{syncStatus.syncError}</div>
              )}
            </div>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || !syncClientId}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {syncing ? "Syncing…" : "Sync Now"}
          </button>
          {syncMsg && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              syncMsg.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {syncMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
