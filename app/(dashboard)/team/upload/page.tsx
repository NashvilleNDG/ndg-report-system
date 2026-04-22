"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Client {
  id: string;
  name: string;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  syncStatus:   string | null;
  syncError:    string | null;
}

export default function TeamUploadPage() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Drive sync
  const [syncClientId, setSyncClientId] = useState("");
  const [syncStatus, setSyncStatus]     = useState<SyncStatus | null>(null);
  const [syncing, setSyncing]           = useState(false);

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

  const handleSync = async () => {
    if (!syncClientId) return;
    setSyncing(true);
    const res  = await fetch("/api/sync/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: syncClientId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Synced ${data.imported ?? 0} period${(data.imported ?? 0) !== 1 ? "s" : ""} from Google Drive`);
      fetchSyncStatus(syncClientId);
    } else {
      toast.error("Sync failed", data.error ?? "An unexpected error occurred.");
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sync Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pull report data directly from the configured Google Drive sheet.
        </p>
      </div>

      {/* ── Google Drive Sync ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.28 3l5.72 9.9L4.35 21H2.5L9.86 9l-4-6.93L6.28 3zm5.44 0h2.56l7.22 12.5-1.28 2.22L14.86 9l-3.14-5.44V3zM4.35 21l1.28-2.22h13.44L20.35 21H4.35z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sync from Google Drive</h2>
            <p className="text-xs text-blue-100">Pull data from the configured Drive sheet</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Client selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Client
            </label>
            <select
              value={syncClientId}
              onChange={(e) => {
                setSyncClientId(e.target.value);
                fetchSyncStatus(e.target.value);
              }}
              disabled={loading}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors disabled:opacity-60"
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sync status */}
          {syncClientId && syncStatus && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-400">Last synced:</span>
                <span className="text-xs font-medium text-gray-700">
                  {syncStatus.lastSyncedAt
                    ? new Date(syncStatus.lastSyncedAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
              {syncStatus.syncStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    syncStatus.syncStatus === "OK"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {syncStatus.syncStatus}
                  </span>
                </div>
              )}
              {syncStatus.syncError && (
                <p className="text-xs text-red-500">{syncStatus.syncError}</p>
              )}
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing || !syncClientId}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {syncing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
